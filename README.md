# Molitveni lanac (KZŠ)

Raspored molitvenog lanca — 48 polusatnih termina kroz 24 sata. Svi mogu vidjeti raspored preko linka; samo voditelj (uz lozinku) može upisivati i brisati imena. Stranica se **ne indeksira** u tražilicama (`noindex` + `robots.txt`).

## Što je unutra
- `index.html` — stranica (dizajn: crno / bijelo / bež, logo iz `logo.png`)
- `api/schedule.js` — spremanje/čitanje rasporeda (Upstash Redis)
- `logo.png` — **dodajte svoj logo ovdje** (ako ga nema, stranica ga samo sakrije)

## Postavljanje na Vercel (jednom)

1. **Push na GitHub** (ovaj repo: `sakicant/molitvenilanac`).
2. Na [vercel.com](https://vercel.com) → **Add New → Project** → odaberite ovaj GitHub repo → **Deploy**.
3. Dodajte bazu za spremanje imena:
   - U projektu: **Storage → Create Database → Upstash (Redis / KV)** → **Connect**.
   - Vercel sam doda varijable `KV_REST_API_URL` i `KV_REST_API_TOKEN` (ili `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`). Kod podržava oba naziva.
4. Dodajte lozinku voditelja:
   - **Settings → Environment Variables → Add**
   - Name: `LEADER_PASSWORD`  ·  Value: *(lozinka po izboru)*
5. **Redeploy** (Deployments → ... → Redeploy) da varijable postanu aktivne.

Link koji dobijete (`https://molitvenilanac.vercel.app` ili sl.) dijelite župljanima.

## Logo
Dodajte datoteku `logo.png` u korijen repozitorija (GitHub → **Add file → Upload files**). Preporuka: prozirna PNG, visine ~200 px.

## Vlastita domena (kasnije, nije obavezno)
Vercel → **Settings → Domains → Add** → upišite npr. `molitva.vasadomena.hr` i dodajte jedan DNS zapis koji Vercel pokaže.

## Kako se koristi
- **Župljani:** otvore link, vide raspored. Prijavu šalju Ivani (091 151 2942).
- **Voditelj:** klik **„Uredi (voditelj)"** → upiše lozinku → upisuje/briše imena; sprema se automatski i svi odmah vide promjene.
