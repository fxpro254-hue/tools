// Configuration - set your WhatsApp number (international format, no plus), USDT address and amount
const WHATSAPP_NUMBER = '254757696797'; // e.g. 14151234567
const USDT_ADDRESS = 'TN8dEtjGKJwCLaKKwPpYaKKN9ynKN2Lf6Y';
const USDT_AMOUNT = 300;

document.addEventListener('DOMContentLoaded', function() {
  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Modal elements
  const demoModal = document.getElementById('demoModal');
  const buyModal = document.getElementById('buyModal');
  const socialModal = document.getElementById('socialModal');
  const challengeModal = document.getElementById('challengeModal');
  const demoModalClose = document.getElementById('demoModalClose');
  const buyModalClose = document.getElementById('buyModalClose');
  const socialModalClose = document.getElementById('socialModalClose');
  const challengeModalClose = document.getElementById('challengeModalClose');

  // All demo CTA buttons (now links, removing old event listeners)
  // demoButtons are now links that navigate to book/index.html

  // All buy CTA buttons
  const buyButtons = [
    'buyNavBtn', 'heroBuy', 'pricingBuy'
  ];

  function openModal(modal) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
  }

  // Show social modal after 500ms on page load
  setTimeout(() => {
    openModal(socialModal);
  }, 500);

  // Wire buy buttons
  buyButtons.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => openModal(buyModal));
  });

  // Close modal buttons
  if (demoModalClose) {
    demoModalClose.addEventListener('click', () => closeModal(demoModal));
  }
  if (buyModalClose) {
    buyModalClose.addEventListener('click', () => closeModal(buyModal));
  }
  if (socialModalClose) {
    socialModalClose.addEventListener('click', () => {
      closeModal(socialModal);
      setTimeout(() => {
        openModal(challengeModal);
      }, 500);
    });
  }
  if (challengeModalClose) {
    challengeModalClose.addEventListener('click', () => {
      closeModal(challengeModal);
    });
  }

  // Click outside to close modals
  [demoModal, buyModal, socialModal, challengeModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        if (modal === socialModal) {
          closeModal(modal);
          setTimeout(() => {
            openModal(challengeModal);
          }, 500);
        } else {
          closeModal(modal);
        }
      }
    });
  });

  // Form submissions
  const demoForm = document.getElementById('demoForm');
  if (demoForm) {
    demoForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const data = new FormData(demoForm);
      const name = data.get('name');
      const email = data.get('email');
      closeModal(demoModal);
      alert(`Thank you, ${name}! We'll contact you at ${email} to schedule your demo.`);
      demoForm.reset();
    });
  }

  const buyForm = document.getElementById('buyForm');
  if (buyForm) {
    buyForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const data = new FormData(buyForm);
      const name = data.get('name');
      const email = data.get('email');
      closeModal(buyModal);
      alert(`Thank you, ${name}! A welcome email has been sent to ${email}. You now have full access to Deriv Hacker.`);
      buyForm.reset();
    });
  }

  // Smooth scroll for navbar links
  document.querySelectorAll('.navbar-link').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          // Close mobile menu after clicking a link
          const navMenu = document.getElementById('navMenu');
          if (navMenu) {
            navMenu.style.display = '';
          }
        }
      }
    });
  });

  // Mobile menu toggle
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      if (navMenu.style.display === 'flex') {
        navMenu.style.display = '';
      } else {
        navMenu.style.display = 'flex';
      }
    });
  }
});

// Copy USDT address to clipboard
function copyToClipboard() {
  const addressInput = document.getElementById('usdtAddress');
  if (addressInput) {
    addressInput.select();
    document.execCommand('copy');
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }
}

// Move to transaction hash input
function proceedToVerification() {
  const email = document.getElementById('paymentEmail').value;
  if (!email) {
    alert('Please enter your email address');
    return;
  }
  
  // Store email in session
  sessionStorage.setItem('paymentEmail', email);
  
  // Hide email step, show verification step
  document.getElementById('paymentStep1').style.display = 'none';
  document.getElementById('paymentStep2').style.display = 'block';
}

// Go back to email input
function goBackToEmail() {
  document.getElementById('paymentStep2').style.display = 'none';
  document.getElementById('paymentStep1').style.display = 'block';
  document.getElementById('verificationMessage').style.display = 'none';
  document.getElementById('transactionHash').value = '';
}

// Verify transaction using Tronscan API
async function verifyTransaction() {
  const txHash = document.getElementById('transactionHash').value.trim();
  const email = sessionStorage.getItem('paymentEmail');
  const verifyBtn = document.getElementById('verifyBtn');
  const messageDiv = document.getElementById('verificationMessage');
  
  if (!txHash) {
    alert('Please paste the transaction hash');
    return;
  }
  
  // Show loading state
  verifyBtn.disabled = true;
  verifyBtn.textContent = 'Verifying...';
  messageDiv.style.display = 'none';
  
  try {
    // Call Tronscan API to verify transaction
    const response = await fetch(`https://apilist.tronscan.org/api/transaction-info?hash=${txHash}`);
    const data = await response.json();
    
    if (!data || !data.contractData) {
      showVerificationError(messageDiv, 'Transaction not found. Please check the hash and try again.');
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Verify Payment';
      return;
    }
    
    // Parse transaction details
    const contractData = data.contractData;
    const txValue = contractData.amount ? (contractData.amount / 1000000) : 0; // USDT has 6 decimals
    const fromAddress = contractData.from || '';
    const toAddress = contractData.to || '';
    const expectedAddress = USDT_ADDRESS;
    
    // Check if payment is correct
    if (toAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
      showVerificationError(messageDiv, '❌ Transaction sent to wrong address. Please verify and resend to the correct address.');
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Verify Payment';
      return;
    }
    
    if (txValue !== USDT_AMOUNT) {
      showVerificationError(messageDiv, `❌ Incorrect amount. Expected ${USDT_AMOUNT} USDT, but received ${txValue} USDT.`);
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Verify Payment';
      return;
    }
    
    // Payment verified successfully
    showVerificationSuccess(messageDiv, txHash, email);
    
    // Close modal after 3 seconds
    setTimeout(() => {
      document.getElementById('buyModal').setAttribute('aria-hidden', 'true');
      resetPaymentModal();
    }, 3000);
    
  } catch (error) {
    console.error('Verification error:', error);
    showVerificationError(messageDiv, 'Error verifying transaction. Please try again or contact support.');
    verifyBtn.disabled = false;
    verifyBtn.textContent = 'Verify Payment';
  }
}

function showVerificationSuccess(messageDiv, txHash, email) {
  messageDiv.style.background = 'rgba(76, 175, 80, 0.1)';
  messageDiv.style.borderLeft = '4px solid #4caf50';
  messageDiv.style.color = '#4caf50';
  messageDiv.innerHTML = `
    <strong>✓ Payment Verified!</strong><br/>
    Transaction: ${txHash.substring(0, 20)}...<br/>
    Email: ${email}<br/><br/>
    Access credentials are being sent to your email now.
  `;
  messageDiv.style.display = 'block';
  document.getElementById('verifyBtn').style.display = 'none';
}

function showVerificationError(messageDiv, message) {
  messageDiv.style.background = 'rgba(244, 67, 54, 0.1)';
  messageDiv.style.borderLeft = '4px solid #f44336';
  messageDiv.style.color = '#ff6a6a';
  messageDiv.innerHTML = message;
  messageDiv.style.display = 'block';
}

function resetPaymentModal() {
  document.getElementById('paymentStep1').style.display = 'block';
  document.getElementById('paymentStep2').style.display = 'none';
  document.getElementById('verificationMessage').style.display = 'none';
  document.getElementById('paymentEmail').value = '';
  document.getElementById('transactionHash').value = '';
  document.getElementById('verifyBtn').style.display = 'block';
  document.getElementById('verifyBtn').disabled = false;
  document.getElementById('verifyBtn').textContent = 'Verify Payment';
}

// Close social modal function
function closeSocialModal() {
  const socialModal = document.getElementById('socialModal');
  const challengeModal = document.getElementById('challengeModal');
  if (socialModal) {
    socialModal.setAttribute('aria-hidden', 'true');
    socialModal.style.display = 'none';
  }
  // Show challenge modal after a delay
  setTimeout(() => {
    if (challengeModal) {
      challengeModal.setAttribute('aria-hidden', 'false');
      challengeModal.style.display = 'flex';
    }
  }, 500);
}
// Open WhatsApp with a prefilled message for users who want to send a screenshot
function openWhatsAppProof() {
  const email = document.getElementById('paymentEmail') && document.getElementById('paymentEmail').value ? document.getElementById('paymentEmail').value : (sessionStorage.getItem('paymentEmail') || '');
  const txHash = document.getElementById('transactionHash') && document.getElementById('transactionHash').value ? document.getElementById('transactionHash').value : '';
  const address = USDT_ADDRESS;
  const amount = USDT_AMOUNT;
  const message = `Hello, I sent ${amount} USDT (TRC20) to ${address}.\nEmail: ${email}\nTransaction hash: ${txHash}\nI have attached a screenshot of the payment. Please confirm.`;

  if (WHATSAPP_NUMBER === 'YOUR_WHATSAPP_NUMBER') {
    alert('Please update the WhatsApp number in the script (WHATSAPP_NUMBER) before using this feature.');
    return;
  }

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
}

// Navigate to Deriv Hacker tool
function goToDigitpro() {
  window.location.href = '/digitpro/';
}

