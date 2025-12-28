/**
 * HaggleAI Chat Widget
 * MVP Version - Simple and lightweight negotiation widget
 */

(function() {
  'use strict';

  // Get configuration from data attributes
  const root = document.getElementById('haggle-ai-root');
  if (!root) {
    console.log('[HaggleAI] Widget root not found');
    return;
  }

  const config = {
    productId: root.dataset.productId,
    variantId: root.dataset.variantId,
    productTitle: root.dataset.productTitle,
    productPrice: parseFloat(root.dataset.productPrice) || 0,
    shopDomain: root.dataset.shopDomain,
    buttonColor: root.dataset.buttonColor || '#6366f1',
    appUrl: root.dataset.appUrl || '/apps/haggle',
  };

  console.log('[HaggleAI] Config:', config);

  // State
  let isOpen = false;
  let sessionId = null;
  let isLoading = false;
  let negotiatedPrice = null;

  // Create widget HTML
  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'haggle-widget';
    widget.innerHTML = `
      <button id="haggle-toggle-btn" style="background-color: ${config.buttonColor}">
        💬 Make an Offer
      </button>
      <div id="haggle-chat-panel" class="haggle-hidden">
        <div id="haggle-header">
          <span>Negotiate Price</span>
          <button id="haggle-close-btn">&times;</button>
        </div>
        <div id="haggle-messages">
          <div class="haggle-message haggle-bot">
            👋 Hi! Interested in the <strong>${config.productTitle}</strong>? 
            The price is <strong>$${config.productPrice.toFixed(2)}</strong>. 
            Make me an offer!
          </div>
        </div>
        <div id="haggle-input-area">
          <div id="haggle-input-row">
            <span class="haggle-currency">$</span>
            <input type="number" id="haggle-offer-input" placeholder="Your offer" step="0.01" min="1">
            <button id="haggle-send-btn" style="background-color: ${config.buttonColor}">Send</button>
          </div>
        </div>
        <div id="haggle-action-area" class="haggle-hidden">
          <button id="haggle-add-cart-btn" style="background-color: ${config.buttonColor}">
            🛒 Add to Cart at $<span id="haggle-final-price">0</span>
          </button>
        </div>
      </div>
    `;
    root.appendChild(widget);

    // Attach event listeners
    document.getElementById('haggle-toggle-btn').addEventListener('click', toggleChat);
    document.getElementById('haggle-close-btn').addEventListener('click', toggleChat);
    document.getElementById('haggle-send-btn').addEventListener('click', sendOffer);
    document.getElementById('haggle-offer-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendOffer();
    });
    document.getElementById('haggle-add-cart-btn').addEventListener('click', addToCart);
  }

  // Toggle chat panel
  function toggleChat() {
    isOpen = !isOpen;
    const panel = document.getElementById('haggle-chat-panel');
    const btn = document.getElementById('haggle-toggle-btn');
    
    if (isOpen) {
      panel.classList.remove('haggle-hidden');
      btn.classList.add('haggle-hidden');
      document.getElementById('haggle-offer-input').focus();
    } else {
      panel.classList.add('haggle-hidden');
      btn.classList.remove('haggle-hidden');
    }
  }

  // Add message to chat
  function addMessage(text, isUser = false) {
    const messages = document.getElementById('haggle-messages');
    const msg = document.createElement('div');
    msg.className = `haggle-message ${isUser ? 'haggle-user' : 'haggle-bot'}`;
    msg.innerHTML = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  // Send offer to backend
  async function sendOffer() {
    if (isLoading) return;

    const input = document.getElementById('haggle-offer-input');
    const offer = parseFloat(input.value);

    if (!offer || offer <= 0) {
      addMessage('Please enter a valid offer amount.', false);
      return;
    }

    addMessage(`My offer: <strong>$${offer.toFixed(2)}</strong>`, true);
    input.value = '';
    isLoading = true;

    // Show loading
    const sendBtn = document.getElementById('haggle-send-btn');
    sendBtn.textContent = '...';
    sendBtn.disabled = true;

    try {
      const response = await fetch(`${config.appUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: config.productId,
          variantId: config.variantId,
          productTitle: config.productTitle,
          productPrice: config.productPrice,
          offer: offer,
          sessionId: sessionId,
        }),
      });

      const data = await response.json();
      console.log('[HaggleAI] Response:', data);

      if (data.sessionId) {
        sessionId = data.sessionId;
      }

      addMessage(data.message || 'Something went wrong. Please try again.');

      if (data.accepted) {
        negotiatedPrice = offer;
        showAddToCartButton(offer);
      }

    } catch (error) {
      console.error('[HaggleAI] Error:', error);
      addMessage('Sorry, there was an error. Please try again.');
    } finally {
      isLoading = false;
      sendBtn.textContent = 'Send';
      sendBtn.disabled = false;
    }
  }

  // Show add to cart button
  function showAddToCartButton(price) {
    document.getElementById('haggle-input-area').classList.add('haggle-hidden');
    document.getElementById('haggle-action-area').classList.remove('haggle-hidden');
    document.getElementById('haggle-final-price').textContent = price.toFixed(2);
  }

  // Add to cart with negotiated price
  async function addToCart() {
    if (!sessionId || !negotiatedPrice) {
      addMessage('Please negotiate a price first.');
      return;
    }

    const btn = document.getElementById('haggle-add-cart-btn');
    btn.textContent = 'Adding...';
    btn.disabled = true;

    try {
      // First, sign the offer
      const signResponse = await fetch(`${config.appUrl}/sign-offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
        }),
      });

      const signData = await signResponse.json();
      console.log('[HaggleAI] Sign response:', signData);

      if (signData.error) {
        addMessage('Error: ' + signData.error);
        btn.textContent = '🛒 Try Again';
        btn.disabled = false;
        return;
      }

      // Add to cart with custom attributes
      const variantId = config.variantId || config.productId;
      
      const cartResponse = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            id: variantId,
            quantity: 1,
            properties: {
              '_haggle_price': signData.payload,
              '_haggle_signature': signData.signature,
              '_haggle_session': sessionId,
              'Negotiated Price': `$${negotiatedPrice.toFixed(2)}`,
            }
          }]
        }),
      });

      if (cartResponse.ok) {
        addMessage('🎉 Added to cart! Redirecting to checkout...');
        btn.textContent = '✓ Added!';
        
        // Redirect to cart after a short delay
        setTimeout(() => {
          window.location.href = '/cart';
        }, 1500);
      } else {
        const cartError = await cartResponse.json();
        console.error('[HaggleAI] Cart error:', cartError);
        addMessage('Could not add to cart. Please try again.');
        btn.textContent = '🛒 Try Again';
        btn.disabled = false;
      }

    } catch (error) {
      console.error('[HaggleAI] Cart error:', error);
      addMessage('Error adding to cart. Please try again.');
      btn.textContent = '🛒 Try Again';
      btn.disabled = false;
    }
  }

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }

})();
