\# Dijital YKS Koçum



Dijital YKS Koçum, YKS öğrencilerinin çalışma süreçlerini daha düzenli takip edebilmesi için geliştirilmiş web tabanlı bir öğrenci takip uygulamasıdır.



Bu proje kapsamında öğrencilerin konu takibi yapabilmesi, günlük görevlerini planlayabilmesi, pomodoro çalışma sürelerini kaydedebilmesi ve deneme sınavı analizlerini görüntüleyebilmesi amaçlanmıştır.



\## Özellikler



\- Kullanıcı kayıt ve giriş sistemi

\- JWT tabanlı kullanıcı doğrulama

\- Konu takip modülü

\- Günlük görev ve takvim yönetimi

\- Pomodoro çalışma takibi

\- Deneme sınavı analizi

\- TYT ve AYT alanlarına göre ders/veri yönetimi

\- SQL Server veritabanı bağlantısı

\- Responsive ve kullanıcı dostu arayüz



\## Kullanılan Teknolojiler



\- HTML

\- CSS

\- JavaScript

\- Node.js

\- Express.js

\- SQL Server

\- JWT

\- Git / GitHub



\## Proje Yapısı



\- `controllers/` : Backend kontrol dosyaları

\- `middleware/` : JWT doğrulama ara yazılımı

\- `public/` : HTML, CSS, JavaScript ve görsel dosyaları

\- `routes/` : API route dosyaları

\- `app.js` : Uygulamanın ana başlangıç dosyası

\- `db.js` ve `dbconfig.js` : Veritabanı bağlantı dosyaları

\- `package.json` : Proje bağımlılıkları

\- `README.md` : Proje açıklama dosyası



\## Kurulum



Projeyi çalıştırmak için öncelikle gerekli Node.js paketleri yüklenmelidir.



```bash

npm install

```



Daha sonra proje ana dizininde `.env` dosyası oluşturulmalı ve veri tabanı bağlantı bilgileri tanımlanmalıdır.



Örnek `.env` yapısı:



```env

PORT=3000

JWT\_SECRET=your\_jwt\_secret

DB\_USER=your\_database\_user

DB\_PASSWORD=your\_database\_password

DB\_SERVER=your\_database\_server

DB\_DATABASE=your\_database\_name

```



Projeyi başlatmak için:



```bash

node app.js

```



\## Modüller



\### Konu Takip



Öğrencilerin TYT ve AYT derslerine ait konuları takip edebilmesini sağlar. Tamamlanan konular işaretlenerek ilerleme durumu kaydedilir.



\### Takvim ve Günlük Görevler



Öğrenciler belirli tarihlere günlük görev ekleyebilir ve görevlerin tamamlanma durumunu takip edebilir.



\### Pomodoro



Öğrencilerin çalışma sürelerini ve mola sürelerini takip edebilmesi için pomodoro sistemi kullanılmıştır. Çalışma kayıtları veritabanına kaydedilir.



\### Deneme Analizi



Öğrencilerin deneme sınavı sonuçlarını TYT ve AYT kategorilerine göre kaydedip analiz edebilmesini sağlar.



\## Güvenlik



Projede kullanıcı işlemleri için JWT tabanlı kimlik doğrulama kullanılmıştır. Kullanıcıya özel veriler token doğrulaması ile korunmaktadır.



`.env` dosyası GitHub'a yüklenmemiştir. Bu dosyada veritabanı kullanıcı bilgileri, şifreler ve JWT gizli anahtarı gibi hassas bilgiler yer almaktadır.



\## Geliştiriciler



Bu proje, Bilgisayar Mühendisliği öğrencileri Saliha ve Fatmaeren tarafından dönem projesi kapsamında geliştirilmiştir.

