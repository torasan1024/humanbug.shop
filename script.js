// --- セレクター ---
const slider = document.getElementById('slider');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const searchBtn = document.getElementById('searchBtn');
const searchOverlay = document.getElementById('search-overlay');
const searchInput = document.getElementById('searchInput');
const closeSearch = document.getElementById('closeSearch');
const productItems = document.querySelectorAll('.product-item');
const cartCountEl = document.getElementById('cart-count');
const toastContainer = document.getElementById('toast-container');

// 初期データ取得
let cartData = JSON.parse(localStorage.getItem('bug_university_cart')) || [];
let currentIndex = 0;
const totalSlides = 4;

// 起動時にバッジを更新
updateCartBadge();

function updateCartBadge() {
    if (cartCountEl) {
        cartCountEl.textContent = cartData.length;
    }
}

/**
 * トースト通知を表示する関数
 * 最大3つまで表示し、アニメーションを維持しつつ古いものを整理します
 */
function showToast(message, type = 'success') {
    const maxToasts = 3;
    
    // 現在表示中のトーストを取得
    const currentToasts = toastContainer.querySelectorAll('.toast');
    
    // 3つ以上ある場合、一番古いものをアニメーションなしで即削除して枠を空ける
    if (currentToasts.length >= maxToasts) {
        // 配列の先頭（一番古い）を削除
        currentToasts[0].remove();
    }

    // 新しいトーストを作成
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // コンテナに追加
    toastContainer.appendChild(toast);

    // 強制的にブラウザに描画を認識させてから show クラスを付与（アニメーションの発火）
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // 3秒後に自動消去
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show'); // フェードアウトアニメーション開始
            // アニメーションが終わるのを待ってからDOMから削除（style.cssのtransition時間に合わせる）
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 400); 
        }
    }, 3000);
}

// --- カート機能 ---
productItems.forEach(item => {
    item.addEventListener('click', (e) => {
        // カートボタン内のアイコンなどをクリックしても親のAタグの挙動を制御
        e.preventDefault();

        const pName = item.querySelector('.product-name').textContent;
        const pImg = item.querySelector('img').src;
        const pPriceEl = item.querySelector('.product-price');
        
        // SOLD OUTチェック
        if (pPriceEl.classList.contains('price-soldout')) {
            showToast(`「${pName}」は売り切れです。`, 'error');
            return;
        }

        const pPrice = parseInt(pPriceEl.getAttribute('data-price')) || 0;

        // データを保存
        cartData.push({ name: pName, img: pImg, price: pPrice });
        localStorage.setItem('bug_university_cart', JSON.stringify(cartData));
        
        updateCartBadge();
        showToast(`「${pName}」をカートに追加しました！`, 'success');

        // カートバッジの弾むアニメーション
        cartCountEl.style.transition = "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        cartCountEl.style.transform = "scale(1.5)";
        setTimeout(() => {
            cartCountEl.style.transform = "scale(1)";
        }, 200);
    });
});

// --- 検索機能 ---
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        searchInput.focus();
    });
}

if (closeSearch) {
    closeSearch.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        searchInput.value = "";
        productItems.forEach(item => item.classList.remove('hidden'));
    });
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        productItems.forEach(item => {
            const productName = item.querySelector('.product-name').textContent.toLowerCase();
            item.classList.toggle('hidden', !productName.includes(keyword));
        });
    });
}

// --- スライダー機能 ---
function updateSlider() {
    if (!slider) return;
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
}

function goToNext() {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateSlider();
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        goToNext();
        resetInterval();
    });
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
        resetInterval();
    });
}

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentIndex = index;
        updateSlider();
        resetInterval();
    });
});

// 自動スライド
let slideInterval = setInterval(goToNext, 5000);

function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(goToNext, 5000);
}