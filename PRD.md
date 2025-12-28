# **Stratejik Ürün Spesifikasyonu ve Teknik Mimari Raporu: Shopify İçin Yapay Zeka Tabanlı Dinamik Müzakere Motoru (HaggleAI)**

## **1\. Yönetici Özeti ve Vizyoner Çerçeve**

### **1.1 Projenin Doğuşu ve Stratejik Konumlandırma**

E-ticaret ekosistemi, son yirmi yılda dijitalleşme ve otomasyon sayesinde devasa bir büyüme kaydetmiş olsa da, fiyatlandırma mekanizmaları şaşırtıcı derecede statik ve ilkel kalmıştır. Fiziksel perakendede, özellikle yüksek değerli ürünlerde, lüks mallarda veya antika gibi benzersiz envanterlerde "pazarlık" (müzakere), alıcının ödeme istekliliği ile satıcının marj gereksinimlerini eşitleyen temel bir piyasa mekanizmasıdır. Ancak dijital dünyada bu mekanizma, yerini sabit fiyatlara ve dönüşüm oranlarını artırmak amacıyla dağıtılan statik indirim kodlarına bırakmıştır. Bu durum, tüccarlar için marka değerinin aşınmasına, tüketiciler için ise indirim bekleme alışkanlığının (fiyat şartlanması) pekişmesine neden olmaktadır.

Bu rapor, Shopify platformu üzerinde çalışacak, "HaggleAI" (geçici kod adı) olarak adlandırılan, Yapay Zeka (YZ) destekli bir müzakere uygulamasının uçtan uca geliştirilmesi, teknik mimarisi ve pazara giriş stratejisini detaylandırmaktadır. Önerilen çözüm, basit bir "Teklif Ver" butonu veya kural tabanlı bir chatbot değildir; aksine, davranışsal ekonomi prensiplerini ve Büyük Dil Modellerini (LLM) kullanarak, kullanıcılarla gerçek zamanlı, doğal dilde pazarlık yapan ve satıcının belirlediği finansal sınırlar dahilinde anlaşmayı otonom olarak kapatan bir "Dijital Satış Temsilcisi"dir.1

Pazar araştırmaları ve rekabet analizleri, mevcut çözümlerin iki uçta kümelendiğini göstermektedir: Bir yanda, Nibble gibi yüksek maliyetli ve karmaşık kurumsal çözümler; diğer yanda ise Negotio gibi manuel onay gerektiren, alışveriş akışını kesintiye uğratan basit "form" tabanlı uygulamalar bulunmaktadır.2 HaggleAI, bu iki uç arasındaki "Kayıp Orta"yı (Missing Middle) hedefleyerek, özellikle tekil envanter (vintage, antika, sanat) ve yüksek değerli (mobilya, elektronik) ürünler satan tüccarlar için erişilebilir, güvenli ve oyunlaştırılmış bir müzakere deneyimi sunacaktır.

### **1.2 Teknik İnovasyon ve Güvenlik Mimarisi**

Projenin teknik omurgası, Shopify'ın en yeni nesil altyapısı olan "Shopify Functions" (Wasm) üzerine inşa edilecektir. Eski nesil "Shopify Scripts" teknolojisinin yerini alan bu yapı, sepet dönüşümlerini (Cart Transform API) ve indirim mantığını (Discount Allocator API) sunucu tarafında güvenli ve performanslı bir şekilde yürütmemize olanak tanır.3

Raporun en kritik teknik katkısı, istemci tarafı manipülasyonlarını (Price Spoofing) önlemek için geliştirilen "HMAC İmza Tabanlı Güvenlik Protokolü"dür. Birçok Shopify uygulaması, indirimleri uygulamak için tarayıcı tabanlı (JavaScript) yöntemlere güvenirken, bu durum kötü niyetli kullanıcıların HTML özniteliklerini değiştirerek fiyatları manipüle etmesine açıktır. HaggleAI mimarisi, arka uçta (Remix App) üretilen ve kriptografik olarak imzalanan fiyat tekliflerinin, Shopify'ın güvenli sunucularında (Functions) doğrulanarak sepete işlenmesini sağlayan hibrit bir yapı önermektedir.5 Bu yaklaşım, kurumsal düzeyde güvenlik sağlarken, uygulamanın kurulum ve kullanım kolaylığını korumaktadır.

### **1.3 Ekonomik Değer Önerisi**

HaggleAI'nin temel ekonomik tezi, "Tüketici Artığını" (Consumer Surplus) yakalamaktır. Sabit fiyatlamada, ürüne 100$ ödemeye razı olan bir müşteriye 80$'a satış yaptığınızda 20$'lık potansiyel kârı masada bırakırsınız. Tersi durumda, ürüne 75$ ödemeye razı olan bir müşteri, 80$ fiyatı görünce alışverişten vazgeçer. Dinamik müzakere, her müşterinin ödeme eşiğine en yakın fiyatı bularak hem dönüşüm oranını (CR) hem de ortalama sepet tutarını (AOV) maksimize eder.7

## ---

**2\. Kapsamlı Pazar Analizi ve Rekabet Ortamı**

### **2.1 Mevcut Pazarın Durumu: Konuşmalı Ticaretin Evrimi**

2024 ve 2025 projeksiyonları, e-ticarette "Conversational Commerce" (Konuşmalı Ticaret) kavramının, basit müşteri desteğinden aktif satış kapamaya doğru evrildiğini göstermektedir. Büyük işletmelerin %70'inden fazlası, müşteri etkileşimlerinde konuşmalı platformları kullanırken, bu etkileşimlerin "müzakere" boyutu henüz doymamış bir pazar olarak öne çıkmaktadır.8

Geleneksel e-ticaret deneyimi (Arama \-\> Ürün Sayfası \-\> Sepet \-\> Ödeme) doğrusaldır ve etkileşimden yoksundur. Müşteriler, özellikle yüksek fiyatlı veya benzersiz ürünlerde, bir satış temsilcisiyle etkileşime girme, ürün hakkında güvence alma ve fiyatta bir "kazanım" elde etme arayışındadır. Mevcut pazar verileri, YZ destekli sohbetlerin satın alma olasılığını kural tabanlı botlara göre önemli ölçüde artırdığını doğrulamaktadır.1 Ancak pazarın büyük çoğunluğu hala "Canlı Destek" (insan gücü gerektirir ve ölçeklenemez) veya "Statik İndirim Popup'ları" (kâr marjını herkese feda eder) arasında sıkışmıştır.

### **2.2 Rakip Analizi ve Stratejik Boşluklar**

Pazardaki mevcut oyuncular analiz edildiğinde, HaggleAI için net bir konumlandırma fırsatı ortaya çıkmaktadır.

#### **2.2.1 Nibble (Pazar Lideri ve Referans Noktası)**

* **Analiz:** Nibble, akademik müzakere taktikleri ve davranışsal bilimi kullanarak başarılı bir model oluşturmuştur. En büyük gücü, sohbeti yürüten LLM ile finansal kararları veren algoritmayı birbirinden ayıran "Güvenli Mimari"sidir.1 Bu, YZ'nın halüsinasyon görerek ürünü 1$'a satmasını engeller.  
* **Zayıf Yönleri:** Fiyatlandırması (aylık 99$'dan başlar) ve entegrasyon karmaşıklığı, onu KOBİ'ler ve düşük hacimli ancak yüksek marjlı (vintage) satıcılar için erişilmez kılmaktadır. Ayrıca, görsel özelleştirme yetenekleri sınırlı olarak raporlanmıştır.1  
* **HaggleAI Fırsatı:** Nibble'ın teknolojisini daha erişilebilir bir fiyat noktasına (Freemium model) taşımak ve özellikle kurulum kolaylığına (Plug-and-Play) odaklanmak.

#### **2.2.2 Negotio ve "Make an Offer" Uygulamaları**

* **Analiz:** Bu uygulamalar genellikle bir "Teklif Ver" butonu ekler. Kullanıcı bir fiyat girer ve sistem ya otomatik kurallara göre kabul eder ya da satıcıya e-posta gönderir.2  
* **Zayıf Yönleri:** Bu model, satın alma dürtüsünü (impulse buying) öldürür. E-posta onayı beklemek, müşterinin soğumasına ve rakip siteye gitmesine neden olur. "Anlık Tatmin" (Instant Gratification) eksiktir.  
* **HaggleAI Fırsatı:** "Asenkron" (beklemeli) değil, "Senkron" (eşzamanlı) müzakere. Müşteri 45 saniye içinde pazarlığı bitirip ödemeyi tamamlamalıdır. Hız, en büyük rekabet avantajıdır.

#### **2.2.3 Omnicierge ve Diğerleri**

* **Analiz:** Bu uygulamalar genellikle genel amaçlı "Alışveriş Asistanı" olarak konumlanır.9 Odak noktaları dağılmıştır (ürün bulma, destek, pazarlık).  
* **HaggleAI Fırsatı:** Dikey odaklanma. HaggleAI bir "asistan" değil, bir "müzakerecidir". Tek görevi, fiyat hassasiyeti olan müşteriyi en yüksek olası fiyattan ikna etmektir.

### **2.3 Hedef Kitle: "Vintage" ve "High-Ticket" Nişi**

Analizlerimiz, "Dropshipping" yapan genel satıcıların ötesinde, çok daha acil ve çözülmemiş bir soruna sahip olan özel bir satıcı grubunu işaret etmektedir: **Tekil ve Antika Ürün Satıcıları**.10

* **Pazar Gerçekliği:** Bir antika satıcısı, 19\. yüzyıldan kalma bir masayı 1.200$'a listeler. Bu ürünün "tavsiye edilen perakende satış fiyatı" (MSRP) yoktur. Değer subjektiftir. Satıcı aslında 900$'a razıdır. Müşteri 850$ teklif etmek ister ama butonu göremez ve 1.200$'ı pahalı bularak siteden ayrılır.  
* **Envanter Likiditesi:** Bu satıcılar için en büyük sorun "stok devir hızıdır". Ürün satılana kadar depo maliyeti yaratır. HaggleAI, bu "ölü stoğu" nakde çevirmek için kritik bir araçtır.12  
* **Kültürel Uyum:** Antika ve ikinci el pazarının (Recommerce) doğasında pazarlık vardır. Alıcılar bu süreci bekler ve sever. Bu kitleye yönelik pazarlama, "İndirim Aracı" değil, "Otomatik Mezat Yönetimi" olarak yapılacaktır.

## ---

**3\. Ürün Vizyonu ve Davranışsal Ekonomi Temelleri**

### **3.1 "Conversation-to-Conversion" (Konuşmadan Dönüşüme) Modeli**

HaggleAI'nin temel felsefesi, indirimin bir "hediye" değil, bir "kazanım" olarak sunulmasıdır. Davranışsal ekonomide "Endowment Effect" (Sahiplik Etkisi) olarak bilinen ilke, kullanıcıların emek harcayarak elde ettikleri (pazarlıkla kazandıkları) fiyata daha fazla değer verdiklerini gösterir.13 Kullanıcı, "Bu site %10 indirim veriyor" demek yerine, "Ben pazarlıkla %10 indirim kopardım" hissine kapıldığında, sepeti terk etme olasılığı dramatik şekilde düşer.

### **3.2 Temel Özellik Seti (MVP ve Ötesi)**

#### **3.2.1 MVP (Minimum Uygulanabilir Ürün) Gereksinimleri**

1. **Akıllı Sohbet Widget'ı:** Ürün sayfalarında, "Sepete Ekle" butonunun yakınında, dikkat çekici ama rahatsız etmeyen bir "Pazarlık Et" butonu (Floating Action Button \- FAB).  
2. **Marj Koruma Motoru:** Satıcının yönetici panelinden belirlediği "Taban Fiyat" (Floor Price) ve "Hedef Fiyat" (Target Price). YZ, asla taban fiyatın altına inmez.  
3. **Deterministik Mantık Kapısı (Logic Gate):** LLM (Dil Modeli) sadece metin üretir, fiyat kararı vermez. Fiyat teklifi, deterministik bir kod bloğu (kural seti) tarafından hesaplanır ve LLM'e "Bu fiyatı öner" şeklinde talimat verilir. Bu, güvenlik için zorunludur.1  
4. **Anlık Ödeme Yönlendirmesi:** Anlaşma sağlandığında, sistem kullanıcıyı otonom olarak ödeme sayfasına (Checkout) yönlendirmeli ve anlaşılan fiyatı *satır öğesi* (Line Item) bazında güncellemelidir. İndirim kodu kopyala-yapıştır devri kapanmıştır.

#### **3.2.2 İleri Seviye Özellikler (Faz 2\)**

1. **Stok Duyarlı Agresiflik:** Eğer bir ürünün stoğu yüksekse veya ürün 90 gündür satılmıyorsa, YZ daha "yumuşak" davranıp fiyatı daha hızlı düşürebilir. Stok azsa, "zorlu polis" moduna geçip indirimi kısabilir.14  
2. **Çıkış Niyeti (Exit Intent) Tetikleyicisi:** Kullanıcı fareyi tarayıcıyı kapatmaya götürdüğünde, widget otomatik açılarak "Gitme, senin için bir teklifim var" diyebilmelidir.1  
3. **Paketleme (Bundling) Müzakeresi:** "Eğer o sandalyeyi de alırsan, masada istediğin fiyata inerim" diyebilen, sepet değerini (AOV) artıran çapraz satış yeteneği.15

## ---

**4\. Teknik Mimari ve Mühendislik Spesifikasyonu**

Bu proje, bir "Hello World" uygulaması değil, finansal işlem yapan kritik bir sistemdir. Bu nedenle mimari, güvenlik (Security), tutarlılık (Consistency) ve performans (Performance) üzerine kurulmalıdır. Shopify'ın eski teknolojileri (Script Editor, Checkout.liquid) kullanımdan kaldırıldığı için, mimari tamamen modern "Shopify Functions" ve "Remix" üzerine kurgulanacaktır.16

### **4.1 Yüksek Seviye Sistem Bileşenleri**

1. **Yönetici Paneli (Merchant Admin):** Shopify App Bridge ve Polaris UI kütüphanesi kullanılarak oluşturulan, satıcının kuralları girdiği arayüz.18  
2. **Arka Uç (Backend API):** Node.js tabanlı Shopify Remix şablonu. Bu katman, OpenAI API ile iletişim kurar, müzakere oturumlarını yönetir ve şifreleme anahtarlarını saklar.19  
3. **Ön Yüz (Storefront Widget):** React ile yazılmış, "Theme App Extensions" (Tema Uygulama Uzantıları) aracılığıyla mağazaya enjekte edilen, hafif ve hızlı sohbet arayüzü.21  
4. **Platform Mantığı (Shopify Functions):** Rust dilinde yazılmış, WebAssembly (Wasm) olarak derlenmiş ve Shopify'ın sunucularında çalışan, sepet fiyatını nihai olarak değiştiren kod parçası.22

### **4.2 Güvenlik Mimarisi: HMAC İmzalama Protokolü**

En büyük teknik risk "Price Spoofing"dir (Fiyat Sahteciliği). Eğer ön yüz, sepete sadece {price: 50} gibi bir veri gönderirse, kötü niyetli bir kullanıcı tarayıcı konsolunu kullanarak bu değeri {price: 1} yapabilir. Bunu engellemek için kriptografik bir güven zinciri kurulmalıdır.

#### **Adım Adım Güvenli Akış:**

1. **Anlaşma (Sunucu Tarafı):** Kullanıcı ve YZ sohbet eder. YZ, 100 TL'lik ürün için 80 TL'ye anlaşır. Arka uç (Backend), bu anlaşmayı onaylar.  
2. **İmzalama (Signing):** Arka uç, şu verileri içeren bir JSON payload oluşturur:  
   * variant\_id: Ürün ID'si.  
   * price: 80.00.  
   * cart\_token: Kullanıcının sepet ID'si (Başkasının sepetinde kullanılamaması için).  
   * timestamp: Zaman damgası (Teklifin 15 dakika sonra geçersiz olması için \- Replay Attack koruması).  
   * Bu payload, satıcıya özel gizli bir anahtar (Secret Key) ile **HMAC-SHA256** algoritması kullanılarak imzalanır.23  
3. **İletim ve Saklama:** İmzalı veri ve imza (hash), ön yüze gönderilir. Ön yüz, bu verileri Shopify Ajax Cart API kullanarak sepetin "Attributes" (Nitelikler) alanına kaydeder (\_negotiated\_price, \_signature).25 Alt çizgi (\_) kullanımı, bu verilerin temada müşteriye görünmesini engeller.27  
4. **Doğrulama (Shopify Function):**  
   * Kullanıcı ödeme sayfasına (Checkout) gittiğinde, Rust ile yazılmış **Cart Transform Function** devreye girer.  
   * Function, sepet niteliklerinden fiyatı ve imzayı okur.  
   * Function, aynı gizli anahtarı (Shop Metafield üzerinden güvenli bir şekilde erişerek) kullanarak imzayı yeniden hesaplar.28  
   * Eğer Hesaplanan İmza \== Gelen İmza ise, fonksiyon update operasyonu ile sepet fiyatını 80 TL olarak revize eder. Eşleşmezse işlem reddedilir ve orijinal fiyat (100 TL) uygulanır.5

### **4.3 API Seçimi: Discount Allocator vs. Cart Transform**

Shopify iki ana yöntem sunar:

1. **Discount Allocator API:** Sepete bir "indirim" (örn. %20) uygular.  
2. **Cart Transform API:** Sepet satırını tamamen değiştirir (fiyatı, başlığı, görseli).

**Karar:** **Cart Transform API** kullanılmalıdır. Müzakere sonucu genellikle net bir fiyattır (örn. "725 TL"). Yüzdesel hesaplamalarla uğraşmak yerine, fiyatın doğrudan "override" edilmesi (üzerine yazılması) hem teknik olarak daha temizdir hem de kullanıcının pazarlık ettiği rakamı kuruşu kuruşuna görmesini sağlar.3 Ayrıca, Cart Transform API, "Bundle" (Paket) oluşturma yeteneği sayesinde, çoklu ürün pazarlıklarında (Örn: "Masa ve Sandalye toplam 5000 TL") ürünleri tek bir satırda birleştirerek lojistik ve vergi hesaplamalarını kolaylaştırır.29

### **4.4 Veritabanı ve Oturum Yönetimi**

Veritabanı olarak **Prisma (PostgreSQL)** kullanılacaktır. Her müzakere bir "Oturum" (Session) olarak kaydedilmelidir.

* SessionID: Benzersiz tanımlayıcı.  
* ChatLog: Konuşma geçmişi (Analitik ve itiraz durumları için).  
* CurrentOffer: O anki en son teklif.  
* Status: (Active, Accepted, Rejected, Abandoned).  
  Bu yapı, satıcıya "Hangi fiyat noktalarında anlaşma sağlandı?" veya "Hangi noktada müşteri vazgeçti?" gibi derin içgörüler sunmamızı sağlar.31

## ---

**5\. Uygulama Geliştirme Yol Haritası (Adım Adım)**

Bu süreç, çevik (agile) metodolojiye uygun olarak 4 ana faza bölünmüştür.

### **Faz 1: "Sessiz Beyin" (Backend ve YZ Mantığı) \- 1\. Ay**

Bu aşamada arayüz yoktur, sadece mantık çalışır.

* **Adım 1:** Shopify CLI kullanılarak Remix şablonu ile proje başlatılır (npm init @shopify/app@latest).  
* **Adım 2:** OpenAI API entegrasyonu yapılır. "System Prompt" mühendisliği ile YZ'ya "Sen bir vintage mağazası sahibisin, naziksin ama kârını korursun" gibi persona tanımlanır.32  
* **Adım 3:** "Logic Middleware" yazılır. Bu, LLM'den gelen yanıtı filtreler. Eğer LLM "Tamam, 5 TL olsun" derse ama taban fiyat 50 TL ise, bu katman devreye girip yanıtı "Üzgünüm, o fiyata inemem" olarak değiştirir. Güvenlik YZ'ya bırakılmaz.

### **Faz 2: "İnfaz Memuru" (Shopify Function ve Güvenlik) \- 2\. Ay**

Fiyatın sepete güvenle uygulanması.

* **Adım 1:** shopify app generate extension \--template cart\_transform komutu ile Rust projesi oluşturulur.  
* **Adım 2:** run.graphql dosyası düzenlenerek, sepet niteliklerine (cart.attribute) erişim izni tanımlanır.22  
* **Adım 3:** Rust içinde HMAC doğrulama kütüphanesi (sha2, hmac crates) entegre edilir. JavaScript yerine Rust kullanımı, Shopify'ın katı bellek ve süre limitleri (5ms \- 200ms) içinde kriptografik işlem yapabilmek için kritiktir.6  
* **Adım 4:** Mağaza Metafield'larına gizli anahtarın (Secret Key) güvenli şekilde yazılması ve okunması test edilir.33

### **Faz 3: "Vitrin Yüzü" (Chat Widget ve UX) \- 3\. Ay**

Kullanıcının gördüğü kısım.

* **Adım 1:** React ile sohbet penceresi tasarlanır. Mobil uyumluluk (Responsive Design) en kritik önceliktir çünkü trafik %80 mobildir. Klavye açıldığında sohbetin kapanmaması gerekir.34  
* **Adım 2:** "Theme App Extension" kullanılarak widget mağazaya enjekte edilir. Bu, satıcının kod bilgisi olmadan tek tıkla uygulamayı aktif etmesini sağlar.35  
* **Adım 3:** Animasyonlar eklenir. Anlaşma sağlandığında ekrana konfeti yağması veya sanal bir el sıkışma grafiği, dopamin salgısını artırarak satışı kesinleştirir.36

### **Faz 4: Entegrasyon ve Beta Testi \- 4\. Ay**

* **Adım 1:** Uçtan uca (E2E) testler. Sepetteki ürün miktarı değiştirildiğinde fiyatın ne olacağı (Birim fiyat mı sabit kalacak, toplam fiyat mı?) senaryoları test edilir.  
* **Adım 2:** Yük testleri. Black Friday gibi dönemlerde YZ API'sinin gecikme (latency) sürelerinin kullanıcı deneyimini bozmaması için "Stream" (akış) yanıt yapısı kurulur.

## ---

**6\. Pazara Giriş ve Büyüme Stratejisi**

### **6.1 Hedef Pazar Segmentasyonu ve "Niş" Odaklanma**

Genel bir "İndirim Uygulaması" olarak pazara girmek, okyanusta damla olmak demektir. Bunun yerine, "Keskin Nişancı" stratejisi uygulanacaktır.

* **Birincil Hedef:** Vintage, Antika ve İkinci El Mobilya Satıcıları. Bu kitle, tekil envanter yönetir ve "sabit fiyat" sürtünmesinden en çok zarar gören kitle onlardır.10  
* **İkincil Hedef:** Yüksek Değerli (High-Ticket) Dropshipping yapanlar. 1000$'lık bir üründe 50$'lık bir indirim, dönüşümü kurtarabilir.37

### **6.2 Topluluk Tabanlı Pazarlama (Community Seeding)**

Reklam bütçesi harcamak yerine, hedef kitlenin bulunduğu dijital alanlara "sızma" stratejisi izlenecektir.

* **Platformlar:** Reddit (r/shopify, r/flipping, r/ecommerce) ve Discord sunucuları (High Ticket Dropshipping toplulukları).38  
* **İçerik Stratejisi:** "Uygulamamızı yükleyin" demek yerine, "Vaka Analizi" paylaşılacaktır: *"Bir vintage satıcısının 6 aydır satılmayan stoğunu YZ ile nasıl 24 saatte erittik?"* başlıklı, veriye dayalı içerikler paylaşılacaktır. Bu, güven oluşturur.  
* **Antika Forumları:** Houzz veya eBay topluluk forumlarında, satış yapamayan satıcılara çözüm olarak sunulacaktır.40

### **6.3 Uygulama Mağazası Optimizasyonu (ASO)**

Shopify App Store'da görünürlük için doğru anahtar kelimeler hedeflenmelidir.

* **Anahtar Kelimeler:** "Make an Offer", "Price Negotiation", "Haggling", "Vintage Sales", "Inventory Liquidation".  
* **Görsel İletişim:** Uygulama ikonunda ve ekran görüntülerinde "İndirim Yüzdesi" yerine "Anlaşma/El Sıkışma" metaforları kullanılmalıdır. Videolu önizleme, müzakerenin ne kadar hızlı ve eğlenceli olduğunu göstermek için şarttır.41

## ---

**7\. Fiyatlandırma ve Gelir Modeli**

Rakip Nibble'ın yüksek giriş bariyerini kırmak için "Kullanıma Dayalı" ve "Risksiz" bir model benimsenecektir.

1. **Başlangıç Paketi (Garage Sale):**  
   * Aylık Ücret: **0$ (Ücretsiz)**  
   * Komisyon: Müzakere edilen satışlardan **%2.5 İşlem Ücreti**.  
   * Neden: Küçük satıcılar için riski sıfırlar. Sadece onlar kazanırsa biz kazanırız.  
   * Özellik: "Powered by HaggleAI" filigranı zorunlu.  
2. **Büyüme Paketi (Boutique):**  
   * Aylık Ücret: **29$**  
   * Komisyon: **%1 İşlem Ücreti**.  
   * Özellik: Filigran kalkar, özelleştirilebilir renkler ve YZ kişiliği (örn. "Ciddi Tüccar" veya "Neşeli Asistan").  
3. **Pro Paket (Auction House):**  
   * Aylık Ücret: **99$**  
   * Komisyon: **%0**.  
   * Özellik: Sınırsız müzakere, detaylı analitik raporları (Hangi fiyat noktasında direnç kırılıyor?), API erişimi.

## ---

**8\. Risk Yönetimi ve Azaltma Stratejileri**

| Risk | Etki | Azaltma Stratejisi (Mitigation) |
| :---- | :---- | :---- |
| **YZ Halüsinasyonu** | Kritik | YZ'nın fiyat vermesine asla izin verilmez. YZ sadece "sohbeti" yapar. Fiyatı, arka plandaki deterministik kod belirler. YZ metninde "Tamam 1 TL olsun" dese bile, sistem sepete taban fiyatı (örn. 50 TL) yansıtır. |
| **İstemci Tarafı Manipülasyonu** | Kritik | Bölüm 4.2'de detaylandırılan HMAC imza mimarisi, istemci tarafındaki her türlü veri değişikliğini Shopify Functions seviyesinde reddeder. |
| **API Maliyetleri** | Orta | OpenAI token maliyetlerini kontrol altında tutmak için bağlam penceresi (context window) optimize edilir. Gereksiz sohbet geçmişi budanır. Çok yoğun kullanımda daha ucuz modellere (Llama 3 hosted on Groq) geçiş altyapısı hazırlanır. |
| **Kullanıcı Suistimali** | Düşük | Bir kullanıcının sürekli pazarlık yapıp almaması durumunda, IP veya Oturum bazlı sınırlama (Rate Limiting) getirilir. |

## ---

**9\. Sonuç ve Eylem Çağrısı**

HaggleAI projesi, e-ticaretin geleceğindeki "Kişiselleştirilmiş Fiyatlandırma" trendinin öncüsü olma potansiyeline sahiptir. Pazar analizi, özellikle vintage ve yüksek değerli ürün dikeylerinde ciddi bir açlık olduğunu göstermektedir. Teknik olarak, Shopify'ın yeni Functions altyapısı ve YZ'nın erişilebilirliği, bu ürünü geliştirmek için mükemmel bir zamanlama sunmaktadır.

Önerilen strateji, **"Güvenlikten Ödün Vermeyen Hız"** üzerine kuruludur. HMAC tabanlı koruma mekanizması, satıcıların güvenini kazanmanın anahtarıdır. MVP'nin geliştirilmesine derhal başlanmalı ve ilk 90 gün içinde 10-20 pilot antika satıcısı ile beta sürecine girilmelidir. Bu, "Kızıl Okyanus" olan genel Shopify App pazarında, henüz keşfedilmemiş bir "Mavi Okyanus" yaratma fırsatıdır.

#### **Alıntılanan çalışmalar**

1. Nibble: Pricing, Free Demo & Features \- Software Finder, erişim tarihi Aralık 5, 2025, [https://softwarefinder.com/artificial-intelligence/nibble](https://softwarefinder.com/artificial-intelligence/nibble)  
2. 6 Best Shopify Make an Offer Apps to Add Name Your Price, erişim tarihi Aralık 5, 2025, [https://www.magicalapps.com/best-shopify-make-an-offer-apps/](https://www.magicalapps.com/best-shopify-make-an-offer-apps/)  
3. Cart Transform Function API \- Shopify Dev Docs, erişim tarihi Aralık 5, 2025, [https://shopify.dev/docs/api/functions/latest/cart-transform](https://shopify.dev/docs/api/functions/latest/cart-transform)  
4. Discounts Allocator Function API \- Shopify Dev Docs, erişim tarihi Aralık 5, 2025, [https://shopify.dev/docs/api/functions/unstable/discounts-allocator](https://shopify.dev/docs/api/functions/unstable/discounts-allocator)  
5. Securely Passing Bundle Discount from Cart Transform to Discount Function, erişim tarihi Aralık 5, 2025, [https://community.shopify.com/c/shopify-apps/securely-passing-bundle-discount-from-cart-transform-to-discount/td-p/2938595](https://community.shopify.com/c/shopify-apps/securely-passing-bundle-discount-from-cart-transform-to-discount/td-p/2938595)  
6. Shopify HMAC Verification with Rust \- Technically Rural, erişim tarihi Aralık 5, 2025, [https://technicallyrural.ca/2021/09/07/shopify-hmac-verification-with-rust/](https://technicallyrural.ca/2021/09/07/shopify-hmac-verification-with-rust/)  
7. Dynamic Pricing in eCommerce — Guide and Examples \[2025\] \- GemPages, erişim tarihi Aralık 5, 2025, [https://gempages.net/blogs/shopify/ecommerce-dynamic-pricing](https://gempages.net/blogs/shopify/ecommerce-dynamic-pricing)  
8. Conversational Commerce \- Benefits, Use Cases & Examples \- GetStream.io, erişim tarihi Aralık 5, 2025, [https://getstream.io/blog/conversational-commerce/](https://getstream.io/blog/conversational-commerce/)  
9. Omnicierge – AI Shopping Concierge & Price Negotiation \- Shopify App Store, erişim tarihi Aralık 5, 2025, [https://apps.shopify.com/haggle-app](https://apps.shopify.com/haggle-app)  
10. How to Sell Furniture Online | Start a Furniture Business by Making an \[ecommerce website\](/tour/ecommerce-website) \- Shopify, erişim tarihi Aralık 5, 2025, [https://www.shopify.com/sell/furniture](https://www.shopify.com/sell/furniture)  
11. Learn How to Sell Antiques Online with Shopify, erişim tarihi Aralık 5, 2025, [https://www.shopify.com/sell/antiques](https://www.shopify.com/sell/antiques)  
12. Tips often uploading unique products, overall tips for selling unique items \- Shopify Community, erişim tarihi Aralık 5, 2025, [https://community.shopify.com/t/tips-often-uploading-unique-products-overall-tips-for-selling-unique-items/239752](https://community.shopify.com/t/tips-often-uploading-unique-products-overall-tips-for-selling-unique-items/239752)  
13. Top 10 Examples: eCommerce Gamification \- Pimberly, erişim tarihi Aralık 5, 2025, [https://pimberly.com/blog/top-10-ecommerce-gamification-examples-will-revolutionize-shopping/](https://pimberly.com/blog/top-10-ecommerce-gamification-examples-will-revolutionize-shopping/)  
14. How to Create Dynamic Pricing on Shopify \- 2Hats Logic, erişim tarihi Aralık 5, 2025, [https://www.2hatslogic.com/blog/how-to-create-dynamic-pricing-on-shopify/](https://www.2hatslogic.com/blog/how-to-create-dynamic-pricing-on-shopify/)  
15. Shopify discount function dynamic products \#546 \- GitHub, erişim tarihi Aralık 5, 2025, [https://github.com/Shopify/function-examples/discussions/546](https://github.com/Shopify/function-examples/discussions/546)  
16. Shopify Scripts and the Script Editor app, erişim tarihi Aralık 5, 2025, [https://help.shopify.com/en/manual/checkout-settings/script-editor](https://help.shopify.com/en/manual/checkout-settings/script-editor)  
17. Shopify Scripts vs Shopify functions, erişim tarihi Aralık 5, 2025, [https://community.shopify.com/t/shopify-scripts-vs-shopify-functions/402168](https://community.shopify.com/t/shopify-scripts-vs-shopify-functions/402168)  
18. About Shopify App Bridge, erişim tarihi Aralık 5, 2025, [https://shopify.dev/docs/api/app-bridge](https://shopify.dev/docs/api/app-bridge)  
19. Shopify App package for Remix, erişim tarihi Aralık 5, 2025, [https://shopify.dev/docs/api/shopify-app-remix/latest](https://shopify.dev/docs/api/shopify-app-remix/latest)  
20. My Shopify App Template with Remix \+ Vercel \+ Tailwind : r/shopifyDev \- Reddit, erişim tarihi Aralık 5, 2025, [https://www.reddit.com/r/shopifyDev/comments/1i1cl0v/a\_gift\_to\_the\_community\_my\_shopify\_app\_template/](https://www.reddit.com/r/shopifyDev/comments/1i1cl0v/a_gift_to_the_community_my_shopify_app_template/)  
21. App Optimization Guide for Shopify Stores » Speed Boostr, erişim tarihi Aralık 5, 2025, [https://speedboostr.com/app-optimization-guide-for-shopify-stores/](https://speedboostr.com/app-optimization-guide-for-shopify-stores/)  
22. Function APIs \- Shopify Dev Docs, erişim tarihi Aralık 5, 2025, [https://shopify.dev/docs/api/functions/latest](https://shopify.dev/docs/api/functions/latest)  
23. Secure Shopify Webhooks: HMAC Verification & Queue Handling \- Digittrix Infotech, erişim tarihi Aralık 5, 2025, [https://www.digittrix.com/scripts/shopify-webhooks-verify-hmac-queue-processing](https://www.digittrix.com/scripts/shopify-webhooks-verify-hmac-queue-processing)  
24. Generate & Verify HMAC Signatures in Python, Node.js, Go \- Authgear, erişim tarihi Aralık 5, 2025, [https://www.authgear.com/post/generate-verify-hmac-signatures](https://www.authgear.com/post/generate-verify-hmac-signatures)  
25. How To Create Shopify Cart Attributes? (Common Issues & Solutions) \- EComposer, erişim tarihi Aralık 5, 2025, [https://ecomposer.io/blogs/shopify-knowledge/shopify-cart-attributes](https://ecomposer.io/blogs/shopify-knowledge/shopify-cart-attributes)  
26. How to Display Cart Attributes Information Using Shopify Checkout UI Extensions, erişim tarihi Aralık 5, 2025, [https://dev.to/tim\_yone/how-to-display-cart-attributes-information-using-shopify-checkout-ui-extensions-4oe2](https://dev.to/tim_yone/how-to-display-cart-attributes-information-using-shopify-checkout-ui-extensions-4oe2)  
27. Using JavaScript to manage a Shopify cart | Nozzlegear Software, erişim tarihi Aralık 5, 2025, [https://nozzlegear.com/shopify/using-javascript-to-manage-a-shopify-cart](https://nozzlegear.com/shopify/using-javascript-to-manage-a-shopify-cart)  
28. How dangerous is it to pass Private Cart Attributes for use in a Shopify Function, erişim tarihi Aralık 5, 2025, [https://community.shopify.dev/t/how-dangerous-is-it-to-pass-private-cart-attributes-for-use-in-a-shopify-function/20872](https://community.shopify.dev/t/how-dangerous-is-it-to-pass-private-cart-attributes-for-use-in-a-shopify-function/20872)  
29. Combine discount function and cart transformation \- Shopify Community, erişim tarihi Aralık 5, 2025, [https://community.shopify.com/t/combine-discount-function-and-cart-transformation/288099](https://community.shopify.com/t/combine-discount-function-and-cart-transformation/288099)  
30. Unlocking the Full Potential Of Shopify Functions | Blue Badger, erişim tarihi Aralık 5, 2025, [https://badger.blue/blogs/ecommerce-unpacked/shopify-functions-guide-for-ecommerce-stores](https://badger.blue/blogs/ecommerce-unpacked/shopify-functions-guide-for-ecommerce-stores)  
31. How to Create a Shopify App for Its Website with Remix and Prisma \- BlueHorse Software, erişim tarihi Aralık 5, 2025, [https://www.bluehorse.in/blog/how-to-create-a-shopify-app-for-its-website-with-remix-and-prisma](https://www.bluehorse.in/blog/how-to-create-a-shopify-app-for-its-website-with-remix-and-prisma)  
32. How To Use OpenAI Playground for Specialized Tasks (2025) \- Shopify, erişim tarihi Aralık 5, 2025, [https://www.shopify.com/blog/openai-playground](https://www.shopify.com/blog/openai-playground)  
33. Metafields \- Shopify Help Center, erişim tarihi Aralık 5, 2025, [https://help.shopify.com/en/manual/custom-data/metafields](https://help.shopify.com/en/manual/custom-data/metafields)  
34. 12 Mobile App Design Patterns That Boost Retention \- ProCreator, erişim tarihi Aralık 5, 2025, [https://procreator.design/blog/mobile-app-design-patterns-boost-retention/](https://procreator.design/blog/mobile-app-design-patterns-boost-retention/)  
35. Storefront performance \- Shopify Dev Docs, erişim tarihi Aralık 5, 2025, [https://shopify.dev/docs/apps/build/performance/storefront](https://shopify.dev/docs/apps/build/performance/storefront)  
36. 30 Inspiring Animated UI Demo Video Examples For Product Showcase \- ADVIDS, erişim tarihi Aralık 5, 2025, [https://advids.co/blog/30-inspiring-animated-ui-demo-video-examples-for-product-showcase](https://advids.co/blog/30-inspiring-animated-ui-demo-video-examples-for-product-showcase)  
37. 23 Best Luxury Dropship Furniture Suppliers for USA in 2025 \- Sell The Trend, erişim tarihi Aralık 5, 2025, [https://www.sellthetrend.com/blog/dropship-furniture](https://www.sellthetrend.com/blog/dropship-furniture)  
38. Top 23 Best Dropshipping Discord Servers \[July 2025\], erişim tarihi Aralık 5, 2025, [https://dropship-spy.com/blog/top-23-best-dropshipping-discord-servers-july-2025](https://dropship-spy.com/blog/top-23-best-dropshipping-discord-servers-july-2025)  
39. Discord communities : r/dropshipping \- Reddit, erişim tarihi Aralık 5, 2025, [https://www.reddit.com/r/dropshipping/comments/1lvc10s/discord\_communities/](https://www.reddit.com/r/dropshipping/comments/1lvc10s/discord_communities/)  
40. Antiques and Collectibles Forum \- GardenWeb | Houzz, erişim tarihi Aralık 5, 2025, [https://www.houzz.com/discussions/antiques-and-collectibles](https://www.houzz.com/discussions/antiques-and-collectibles)  
41. App Store Optimization: How to Use an Effective ASO Strategy (2024) \- Shopify, erişim tarihi Aralık 5, 2025, [https://www.shopify.com/blog/app-store-optimization](https://www.shopify.com/blog/app-store-optimization)