# 🏍️ MotoZone 

> **🚧 STATUS: WORK IN PROGRESS (Geliştirme Aşamasında) 🚧**

MotoZone, motosiklet sürücüleri için özel olarak tasarlanmış, "Swarm" benzeri bir konum tabanlı sosyal ağ uygulamasıdır. Amacımız, sürücülerin anlık konumlarını arkadaşlarıyla paylaşması, bulundukları mekanlarda "check-in" yapabilmesi, yeni sürüş rotaları keşfedebilmesi ve etkinlikler oluşturabilmesini sağlamaktır.

## 🌟 Özellikler (Mevcut ve Planlanan)

- **Harita Üzerinde Canlı Takip:** Kullanıcılar ve yakındaki diğer sürücülerin harita üzerinde görüntülenmesi (React Leaflet).
- **Check-in Sistemi:** Bulunulan mekanlarda (kafe, rota başlangıcı, dinlenme tesisi) check-in yapma ve durum paylaşımı (Supabase entegrasyonu).
- **Yakındaki Sürücüler:** Etraftaki MotoZone kullanıcılarını listeleme.
- **Etkinlik Yönetimi (CRUD):** Grup sürüşleri veya buluşmalar için etkinlik oluşturma, düzenleme, silme ve listeleme.
- **Gelişmiş Profil ve Oyunlaştırma:** Sürücü profilleri oluşturma, check-in ve paylaşımlar üzerinden puan kazanma. *(Planlanıyor)*
- **Rota Paylaşımı ve Değerlendirme:** Kullanıcıların sevdikleri rotaları paylaşması ve topluluk tarafından puanlanması. *(Planlanıyor)*
- **Motosiklet Dostu Mekanlar:** Harita üzerinde motosiklet sürücülerine uygun mekanların işaretlenmesi. *(Planlanıyor)*
- **Mobil Uyumluluk:** Capacitor sayesinde Android ve iOS için derlenebilir yapı.

## 🛠️ Kullanılan Teknolojiler

- **Frontend:** React, TypeScript, Vite
- **Stil & Tasarım:** Tailwind CSS, Framer Motion, Lucide React
- **Harita Entegrasyonu:** Leaflet, React Leaflet
- **Backend & Veritabanı:** Supabase (PostgreSQL, Kimlik Doğrulama, Gerçek Zamanlı Veritabanı)
- **Mobil Uygulama Çıktısı:** Capacitor

## 🚀 Kurulum

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

### Gereksinimler
- Node.js (önerilen: en güncel LTS sürümü)
- NPM veya Yarn
- Bir Supabase projesi ve veritabanı

### Adımlar

1. **Projeyi Klonlayın:**
   ```bash
   git clone https://github.com/kullanici-adiniz/motozone.git
   cd motozone
   ```

2. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

3. **Gereken Çevresel Değişkenleri (.env) Ayarlayın:**
   Projenin kök dizininde bir `.env` dosyası oluşturun ve `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` gibi projede kullandığınız Supabase API anahtarlarınızı ekleyin.

4. **Geliştirme Sunucusunu Başlatın:**
   ```bash
   npm run dev
   ```
   Uygulama genellikle `http://localhost:5173` adresinde çalışmaya başlayacaktır.

## 📱 Mobil Derleme (Android)

Projeyi Capacitor ile Android cihazlarda test etmek veya uygulamaya build almak isterseniz:

1. Web uygulamasını build yapın:
   ```bash
   npm run build
   ```
2. Assets'i Android klasörüne kopyalayın ve senkronize edin:
   ```bash
   npx cap sync android
   ```
3. Android Studio ile projeyi açın:
   ```bash
   npx cap open android
   ```

## 🤝 Katkıda Bulunma

Proje şu anda **geliştirme (açık beta)** aşamasındadır. Her türlü geri bildirim ve katkı (Pull Request) memnuniyetle karşılanır!

1. Bu depoyu fork'layın.
2. Kendi özellik dalınızı oluşturun (`git checkout -b feature/YeniOzellik`).
3. Değişikliklerinizi commit'leyin (`git commit -m 'feat: yeni özellik eklendi'`).
4. Dalınızı push'layın (`git push origin feature/YeniOzellik`).
5. Bir Pull Request açın.

## 📄 Lisans

Bu proje, açık kaynak topluluğuna katkı sağlamak amacıyla geliştirilmiş olup ilgili `LICENSE` dosyasına tabidir. (Eğer projenizde yoksa lisans eklemeyi unutmayın.)
