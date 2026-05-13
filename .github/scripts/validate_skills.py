#!/usr/bin/env python3
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SKILLS_DIR = ROOT / "skills"
README_PATH = ROOT / "README.md"

ALLOWED_TOOLS = {
    "cursor-ide-browser",
    "chrome-devtools",
    "Framelink_Figma_MCP",
    "ask-question",
}


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def parse_frontmatter(text: str):
    if not text.startswith("---\n"):
        return None, "Missing YAML frontmatter start"
    end = text.find("\n---\n", 4)
    if end == -1:
        return None, "Missing YAML frontmatter end"
    return text[4:end], None


def extract_tools(frontmatter: str):
    tools = []
    in_tools = False
    tools_indent = None
    for raw in frontmatter.splitlines():
        if re.match(r"^\s*tools:\s*$", raw):
            in_tools = True
            tools_indent = len(raw) - len(raw.lstrip(" "))
            continue
        if in_tools:
            indent = len(raw) - len(raw.lstrip(" "))
            if raw.strip() == "":
                continue
            if indent <= tools_indent:
                in_tools = False
                continue
            m = re.match(r"^\s*-\s+(.+?)\s*$", raw)
            if m:
                tools.append(m.group(1))
    return tools


def extract_field(frontmatter: str, field: str):
    pattern = rf"(?m)^{re.escape(field)}:\s*(.+?)\s*$"
    match = re.search(pattern, frontmatter)
    if not match:
        return None
    return match.group(1).strip()


def validate_readme_skill_mentions(readme_text: str, skill_names, errors):
    rows = re.findall(r"(?m)^\|\s*`([a-z0-9-]+)`\s*\|", readme_text)
    for name in rows:
        if name not in skill_names:
            errors.append(f"README.md: Mentions unknown skill '{name}'")


def validate_references_usage(skill_file: Path, text: str, errors):
    references_dir = skill_file.parent / "references"
    if not references_dir.exists():
        return

    rel_skill = skill_file.relative_to(ROOT).as_posix()
    for ref_file in sorted(references_dir.glob("*.md")):
        relative_ref = ref_file.relative_to(skill_file.parent).as_posix()
        if relative_ref not in text:
            errors.append(
                f"{rel_skill}: Missing reference link to '{relative_ref}'"
            )


def main():
    errors = []
    skill_names = set()
    skill_files = sorted(SKILLS_DIR.glob("*/SKILL.md"))

    if not skill_files:
        print("No skill files found.")
        return 1

    for skill_file in skill_files:
        rel = skill_file.relative_to(ROOT).as_posix()
        text = read_text(skill_file)
        frontmatter, err = parse_frontmatter(text)
        if err:
            errors.append(f"{rel}: {err}")
            continue

        name_match = re.search(r"(?m)^name:\s*([a-z0-9-]+)\s*$", frontmatter)
        if not name_match:
            errors.append(f"{rel}: Missing valid 'name' in frontmatter")
            continue
        name = name_match.group(1)
        skill_names.add(name)
        expected_name = skill_file.parent.name
        if name != expected_name:
            errors.append(
                f"{rel}: Frontmatter name '{name}' does not match directory '{expected_name}'"
            )

        description = extract_field(frontmatter, "description")
        if not description:
            errors.append(f"{rel}: Missing 'description' in frontmatter")

        tools = extract_tools(frontmatter)
        for tool in tools:
            if tool not in ALLOWED_TOOLS:
                errors.append(
                    f"{rel}: Unknown compatibility tool '{tool}' "
                    f"(allowed: {sorted(ALLOWED_TOOLS)})"
                )

        validate_references_usage(skill_file, text, errors)

    md_files = []
    for p in ROOT.rglob("*.md"):
        if ".git" in p.parts:
            continue
        if "node_modules" in p.parts or "dist" in p.parts:
            continue
        md_files.append(p)
    md_link_re = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")

    for md in md_files:
        rel_md = md.relative_to(ROOT).as_posix()
        text = read_text(md)

        # Validate local markdown links.
        for _, target in md_link_re.findall(text):
            target = target.strip()
            if (
                not target
                or target.startswith("#")
                or "://" in target
                or target.startswith("mailto:")
            ):
                continue
            path_part = target.split("#", 1)[0]
            resolved = (md.parent / path_part).resolve()
            if not resolved.exists():
                errors.append(f"{rel_md}: Broken link target '{target}'")

        # Validate "skill `xxx`" references map to existing skill names.
        for match in re.finditer(r"skill\s+`([a-z0-9-]+)`", text, flags=re.IGNORECASE):
            ref_name = match.group(1)
            if ref_name not in skill_names:
                errors.append(
                    f"{rel_md}: References unknown skill '{ref_name}'"
                )

    if README_PATH.exists():
        readme_text = read_text(README_PATH)
        validate_readme_skill_mentions(readme_text, skill_names, errors)
    else:
        errors.append("README.md: File not found")

    if errors:
        print("Skill validation failed:")
        for item in errors:
            print(f"- {item}")
        return 1

    print("Skill validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

