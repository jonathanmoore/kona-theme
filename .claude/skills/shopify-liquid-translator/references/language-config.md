# Language Configuration

Per-language metadata for Shopify theme translations. Both `.json` (storefront) and `.schema.json` (editor) files are generated for every language. This reference covers formality, terminology, and language-specific quirks.

## All Languages (30)

| Code | Language | Formality | Cart | Checkout |
|------|----------|-----------|------|----------|
| bg | Bulgarian | formal (Вие) | Количка | Плащане |
| cs | Czech | formal (vy) | Košík | Přejít k pokladně |
| da | Danish | informal (du) | Kurv | Gå til kassen |
| de | German | formal (Sie) | Warenkorb | Zur Kasse |
| el | Greek | formal (εσείς) | Καλάθι | Ολοκλήρωση παραγγελίας |
| es | Spanish | formal (usted), Latin American | Carrito | Finalizar compra |
| fi | Finnish | informal (sinä) | Ostoskori | Siirry kassalle |
| fr | French | formal (vous) | Panier | Passer la commande |
| hr | Croatian | formal (Vi) | Košarica | Plaćanje |
| hu | Hungarian | formal (Ön) | Kosár | Pénztár |
| id | Indonesian | formal (Anda) | Keranjang | Checkout |
| it | Italian | formal (Lei) | Carrello | Procedi al checkout |
| ja | Japanese | polite (です/ます) | カート | ご購入手続きへ |
| ko | Korean | polite/formal | 장바구니 | 결제하기 |
| lt | Lithuanian | formal (Jūs) | Krepšelis | Atsiskaityti |
| nb | Norwegian Bokmål | informal (du) | Handlekurv | Gå til kassen |
| nl | Dutch | formal (u) | Winkelwagen | Afrekenen |
| pl | Polish | formal (Pan/Pani) | Koszyk | Przejdź do kasy |
| pt-BR | Brazilian Portuguese | semi-formal (você) | Carrinho | Finalizar compra |
| pt-PT | European Portuguese | formal | Carrinho | Finalizar compra |
| ro | Romanian | formal (dumneavoastră) | Coș de cumpărături | Finalizare comandă |
| ru | Russian | formal (Вы) | Корзина | Оформить заказ |
| sk | Slovak | formal (vy) | Košík | Prejsť k pokladni |
| sl | Slovenian | formal (vi) | Košarica | Na blagajno |
| sv | Swedish | informal (du) | Varukorg | Gå till kassan |
| th | Thai | polite | ตะกร้าสินค้า | ชำระเงิน |
| tr | Turkish | formal (siz) | Sepet | Ödemeye geç |
| vi | Vietnamese | formal | Giỏ hàng | Thanh toán |
| zh-CN | Simplified Chinese | neutral formal | 购物车 | 结账 |
| zh-TW | Traditional Chinese | neutral formal | 購物車 | 結帳 |

## Language-Specific Notes

**German (de):** Compound nouns are correct — "Versandadresse" not "Versand Adresse". Capitalize all nouns.

**Spanish (es):** Use neutral Latin American Spanish — avoid Spain-specific terms like "cesta" for cart.

**Italian (it):** Use masculine as default for generic references to gendered nouns.

**Portuguese:** pt-BR uses "você" and Brazilian spelling (e.g., "contato"). pt-PT uses European spelling (e.g., "contacto").

**Japanese (ja):** Use katakana for established loan words (カート, チェックアウト). Use honorific prefix お/ご for customer-facing strings. No grammatical plural — use `other` form only.

**Korean (ko):** No grammatical plural — use `other` form only.

**Chinese:** zh-CN uses Simplified characters (mainland), zh-TW uses Traditional (Taiwan). Some terms differ beyond character form. No grammatical plural.

**Thai (th):** No spaces between words — don't add artificial spacing. No grammatical plural.

**Hungarian (hu):** Don't pluralize nouns after numbers — "3 termék" not "3 termékek".

**Turkish (tr):** Don't pluralize nouns after numbers — "3 ürün" not "3 ürünler". Vowel harmony applies to suffixes.

**Slovenian (sl):** Has a dual form (`two`) for exactly 2 items — unusual among languages.

**French (fr):** Use `«guillemets»` only where the source uses quotes — don't add them to UI strings.

**Scandinavian (da, sv, nb):** E-commerce convention is informal (du) despite formal options existing.
