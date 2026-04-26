document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('sifre').value;

            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, sifre: password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Sunucudan gelen token'ı tarayıcıya koyuyoruz localstore olarak
                    localStorage.setItem('token', data.token);


                    if (data.user) {
                        localStorage.setItem('user', JSON.stringify(data.user));
                    }
                    // ------------------------------

                    alert('Giriş başarılı! Ana sayfaya gidiyorsunuz.');

                    window.location.href = 'anasayfa.html';
                } else {
                    alert('Hata: ' + (data.message || 'Giriş bilgileri hatalı.'));
                }
            } catch (error) {
                console.error('Bağlantı Hatası:', error);
                alert('Sunucuya ulaşılamıyor.');
            }
        });
    }
});