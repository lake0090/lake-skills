<template>
  <section class="summary-card">
    <h2 class="summary-title">Order summary</h2>

    <div class="summary-rows">
      <p class="summary-row">
        <span>Subtotal</span>
        <span>$27.44</span>
      </p>
      <p class="summary-row">
        <span>Shipping</span>
        <span>$3.99</span>
      </p>
      <p class="summary-row">
        <span>Tax</span>
        <span>$2.00</span>
      </p>
      <p class="summary-row summary-row-total">
        <span>Total</span>
        <span>$33.43</span>
      </p>
    </div>

    <button class="summary-button" type="button">
      <span>Continue to payment</span>
      <span class="summary-button-icon" aria-hidden="true">
        <svg viewBox="0 0 16 12" role="img" focusable="false">
          <path
            d="M9.175 1L14.5 6M14.5 6L9.175 11M14.5 6H1.5"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </button>
  </section>
</template>

<style scoped>
.summary-card {
  width: min(395px, 100%);
  padding: 24px;
  border: 2px solid #e6e6e6;
  border-radius: 24px;
  background: #fafaf5;
  color: #000000;
  box-sizing: border-box;
}

.summary-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
}

.summary-rows {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-row {
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 16px;
  line-height: 1.3;
}

.summary-row-total {
  font-weight: 600;
  margin-top: 4px;
}

.summary-button {
  margin-top: 32px;
  width: 100%;
  min-height: 48px;
  border: 0;
  border-radius: 8px;
  background: #426b1f;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 8px 24px;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  cursor: pointer;
}

.summary-button-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #ffffff;
  color: #426b1f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.summary-button-icon svg {
  width: 16px;
  height: 12px;
}
</style>
