/**
 * お問い合わせフォーム送信処理 & Discord Webhook通知
 */
(function () {
  'use strict';

  // =====================================================
  // ★★★ 以下にDiscord Webhook URLを設定してください ★★★
  // =====================================================
  var DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1473332256712949883/62vbwR2NVdUBJA9XFOtKWCtmBrdYzKKnCskDR2FF0KtJbo_irBxsQ8wTOtVw5NCLvsdp';

  var form = document.getElementById('contact-form');
  var submitBtn = document.getElementById('submit-btn');
  var btnText = submitBtn.querySelector('.btn-text');
  var btnLoading = submitBtn.querySelector('.btn-loading');
  var formResult = document.getElementById('form-result');

  /**
   * メールアドレス形式チェック
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * エラー表示をクリア
   */
  function clearErrors() {
    var errors = form.querySelectorAll('.field-error');
    for (var i = 0; i < errors.length; i++) {
      errors[i].remove();
    }
    var errorFields = form.querySelectorAll('.has-error');
    for (var j = 0; j < errorFields.length; j++) {
      errorFields[j].classList.remove('has-error');
    }
  }

  /**
   * フィールドにエラーメッセージを追加
   */
  function showFieldError(field, message) {
    field.classList.add('has-error');
    var errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    field.parentNode.appendChild(errorEl);
  }

  /**
   * バリデーション
   */
  function validate() {
    clearErrors();
    var isValid = true;

    var name = document.getElementById('contact-name');
    var email = document.getElementById('contact-email');
    var message = document.getElementById('contact-message');

    if (!name.value.trim()) {
      showFieldError(name, 'お名前を入力してください');
      isValid = false;
    }

    if (!email.value.trim()) {
      showFieldError(email, 'メールアドレスを入力してください');
      isValid = false;
    } else if (!isValidEmail(email.value.trim())) {
      showFieldError(email, '正しいメールアドレスを入力してください');
      isValid = false;
    }

    if (!message.value.trim()) {
      showFieldError(message, 'お問い合わせ内容を入力してください');
      isValid = false;
    }

    return isValid;
  }

  /**
   * ボタン状態を切り替え
   */
  function setLoading(loading) {
    submitBtn.disabled = loading;
    btnText.style.display = loading ? 'none' : '';
    btnLoading.style.display = loading ? 'inline-block' : 'none';
    if (loading) {
      submitBtn.classList.add('is-loading');
    } else {
      submitBtn.classList.remove('is-loading');
    }
  }

  /**
   * 結果メッセージを表示
   */
  function showResult(type, message) {
    formResult.textContent = message;
    formResult.className = 'form-result ' + type;
    formResult.style.display = 'block';

    // 自動で消す（成功時のみ）
    if (type === 'success') {
      setTimeout(function () {
        formResult.style.display = 'none';
      }, 8000);
    }
  }

  /**
   * Discord Webhookへ送信
   */
  function sendToDiscord(data) {
    var now = new Date();
    var timestamp = now.toISOString();

    var payload = {
      embeds: [{
        title: '📩 新しいお問い合わせ',
        color: 0xA5873D,  // primary-colorに合わせたゴールド
        fields: [
          {
            name: '👤 お名前',
            value: data.name,
            inline: true
          },
          {
            name: '📧 メールアドレス',
            value: data.email,
            inline: true
          },
          {
            name: '📋 お問い合わせ種類',
            value: data.category,
            inline: false
          },
          {
            name: '💬 お問い合わせ内容',
            value: data.message,
            inline: false
          }
        ],
        timestamp: timestamp,
        footer: {
          text: 'Kohane Design お問い合わせフォーム'
        }
      }]
    };

    return fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  /**
   * フォーム送信ハンドラ
   */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Webhook URL未設定チェック
    if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL === 'YOUR_DISCORD_WEBHOOK_URL_HERE') {
      showResult('error', 'Discord Webhook URLが設定されていません。管理者にお問い合わせください。');
      return;
    }

    if (!validate()) {
      return;
    }

    var data = {
      name: document.getElementById('contact-name').value.trim(),
      email: document.getElementById('contact-email').value.trim(),
      category: document.getElementById('contact-category').value,
      message: document.getElementById('contact-message').value.trim()
    };

    setLoading(true);
    formResult.style.display = 'none';

    sendToDiscord(data)
      .then(function (response) {
        if (response.ok || response.status === 204) {
          showResult('success', 'お問い合わせを送信しました。ありがとうございます！');
          form.reset();
          clearErrors();
        } else {
          throw new Error('送信エラー: ' + response.status);
        }
      })
      .catch(function (error) {
        console.error('Discord送信エラー:', error);
        showResult('error', '送信に失敗しました。しばらく経ってから再度お試しください。');
      })
      .finally(function () {
        setLoading(false);
      });
  });

})();
