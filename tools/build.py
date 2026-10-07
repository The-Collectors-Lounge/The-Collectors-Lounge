#!/usr/bin/env python3
"""
The Collectors Lounge — générateur de pages statiques (EN / FR / ES).

Usage (optionnel, uniquement si vous modifiez les textes ou les modèles) :
    pip install beautifulsoup4
    python3 tools/build.py

Sources :
    tools/translations.json   tous les textes (EN / FR / ES côte à côte)
    tools/template/*.html     structure des pages
    tools/images.json         variantes d'images WebP (srcset)

Sorties (à la racine du site) :
    index.html, legal.html, privacy.html          (EN)
    fr/…  es/…                                    (FR / ES)
    sitemap.xml, robots.txt, _headers, 404.html
"""
import html as H
import json
import os
from bs4 import BeautifulSoup

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = os.path.join(ROOT, "tools")
SITE = "https://thecollectorslounge.mx"
LANGS = ["en", "fr", "es"]
LOCALES = {"en": "en_US", "fr": "fr_FR", "es": "es_MX"}
PREFIX = {"en": "", "fr": "/fr", "es": "/es"}
# page -> (fichier de sortie, chemin public sans extension)
PAGES = {"index": ("index.html", ""), "legal": ("legal.html", "legal"), "privacy": ("privacy.html", "privacy")}
LABELS = {"en": "EN", "fr": "FR", "es": "ES"}

TR = json.load(open(os.path.join(TOOLS, "translations.json"), encoding="utf-8"))
IMG = json.load(open(os.path.join(TOOLS, "images.json"), encoding="utf-8"))


def read_template(name):
    return open(os.path.join(TOOLS, "template", name + ".html"), encoding="utf-8").read()


def url(lang, page):
    path = PAGES[page][1]
    base = SITE + PREFIX[lang] + "/"
    return base + path


def esc(s):
    return H.escape(s, quote=True)


def tidy_links(s):
    """Liens propres, sans .html (Cloudflare Pages retire l'extension)."""
    return s.replace("/privacy.html", "/privacy").replace("/legal.html", "/legal")


# ---------------------------------------------------------------- images
def img_tag(key, lang, d):
    m = IMG[key]
    v = m["variants"]
    srcset = ", ".join(f"/assets/img/{x['file']} {x['w']}w" for x in v)
    mid = v[min(len(v) - 1, 1)] if len(v) > 1 else v[0]
    big = v[-1]
    alt = esc(d["alt_" + key])
    if key == "hero":
        return (f'<img alt="{alt}" class="hero-img" fetchpriority="high" decoding="async" width="{big["w"]}" height="{big["h"]}" '
                f'src="/assets/img/{mid["file"]}" srcset="{srcset}" sizes="{m["sizes"]}"/>')
    return (f'<img alt="{alt}" class="site-harmonized-image" loading="lazy" decoding="async" width="{big["w"]}" height="{big["h"]}" '
            f'src="/assets/img/{mid["file"]}" srcset="{srcset}" sizes="{m["sizes"]}"/>')


# ---------------------------------------------------------------- head
def head_block(lang, page, d):
    if page == "index":
        title, desc = d["meta_title"], d["meta_description"]
    else:
        title, desc = d["title"] + " — The Collectors Lounge", d["meta_description"]
    alts = "\n".join(f'<link rel="alternate" hreflang="{l}" href="{url(l, page)}"/>' for l in LANGS)
    alts += f'\n<link rel="alternate" hreflang="x-default" href="{url("en", page)}"/>'
    others = "\n".join(f'<meta property="og:locale:alternate" content="{LOCALES[l]}"/>' for l in LANGS if l != lang)
    og_alt = esc(TR["index"][lang]["alt_hero"])
    out = f"""<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}"/>
<link rel="canonical" href="{url(lang, page)}"/>
{alts}
<meta name="theme-color" content="#181816"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="The Collectors Lounge"/>
<meta property="og:title" content="{esc(title)}"/>
<meta property="og:description" content="{esc(desc)}"/>
<meta property="og:url" content="{url(lang, page)}"/>
<meta property="og:image" content="{SITE}/assets/og-image.jpg"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="{og_alt}"/>
<meta property="og:locale" content="{LOCALES[lang]}"/>
{others}
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="{esc(title)}"/>
<meta name="twitter:description" content="{esc(desc)}"/>
<meta name="twitter:image" content="{SITE}/assets/og-image.jpg"/>
<link rel="icon" href="/favicon.ico" sizes="48x48"/>
<link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
<link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
<link rel="preload" href="/assets/fonts/cormorant-garamond-400.woff2" as="font" type="font/woff2" crossorigin/>
<link rel="preload" href="/assets/fonts/manrope-variable.woff2" as="font" type="font/woff2" crossorigin/>"""
    if page == "index":
        h = IMG["hero"]
        hs = ", ".join(f"/assets/img/{x['file']} {x['w']}w" for x in h["variants"])
        out += f'\n<link rel="preload" as="image" imagesrcset="{hs}" imagesizes="{h["sizes"]}" fetchpriority="high"/>'
    if lang == "en":
        # anciens liens /?lang=fr : redirection vers la version statique
        out += '\n<script src="/lang-redirect.js"></script>'
    out += '\n<link rel="stylesheet" href="/styles.css"/>'
    if page != "index":
        out += '\n<link rel="stylesheet" href="/legal.css"/>'
    if page == "index":
        ld = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "Organization",
                    "@id": SITE + "/#organization",
                    "name": "The Collectors Lounge",
                    "legalName": "The Collectors Lounge S.R.L., S. de R.L.",
                    "url": SITE + "/",
                    "logo": SITE + "/icon-512.png",
                    "image": SITE + "/assets/og-image.jpg",
                    "description": TR["index"]["en"]["meta_description"],
                    "email": "brands@thecollectorslounge.mx",
                    "address": {"@type": "PostalAddress", "addressLocality": "Mérida", "addressRegion": "Yucatán", "addressCountry": "MX"},
                    "contactPoint": [
                        {"@type": "ContactPoint", "contactType": "sales", "email": "brands@thecollectorslounge.mx",
                         "telephone": "+33666973976", "availableLanguage": ["English", "French", "Spanish"]}
                    ],
                },
                {"@type": "WebSite", "@id": SITE + "/#website", "url": SITE + "/", "name": "The Collectors Lounge",
                 "inLanguage": ["en", "fr", "es"], "publisher": {"@id": SITE + "/#organization"}},
            ],
        }
        out += '\n<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + "</script>"
    return out


def lang_switcher(lang, page, d):
    links = ""
    for l in LANGS:
        cur = ' class="active" aria-current="true"' if l == lang else ""
        p = PREFIX[l] + "/" + PAGES[page][1]
        links += f'<a data-lang="{l}" href="{p}" hreflang="{l}" lang="{l}"{cur}>{LABELS[l]}</a>'
    return f'<div aria-label="{esc(d["lang_aria"])}" class="lang-switcher">{links}</div>'


# ---------------------------------------------------------------- rendu
def render(page, lang):
    d = TR[page][lang]
    tpl = read_template(page)
    pre = PREFIX[lang]
    s = tpl.replace("{{lang}}", lang).replace("{{p}}", pre)
    s = s.replace("<!--HEAD-->", head_block(lang, page, TR["index"][lang] if page == "index" else d))
    s = s.replace("<!--LANGSWITCH-->", lang_switcher(lang, page, d))
    if page == "index":
        for key in IMG:
            s = s.replace(f"<!--IMG:{key}-->", img_tag(key, lang, d))
    soup = BeautifulSoup(s, "html.parser")
    # textes
    for el in soup.select("[data-i18n]"):
        k = el["data-i18n"]
        if k not in d:
            raise KeyError(f"[{page}/{lang}] clé manquante : {k}")
        el.clear()
        el.append(BeautifulSoup(d[k].replace("{{p}}", pre), "html.parser"))
    # attributs (aria-label, href…) : data-i18n-attr="attr:clé;attr2:clé2"
    for el in soup.select("[data-i18n-attr]"):
        for pair in el["data-i18n-attr"].split(";"):
            attr, k = pair.split(":")
            if k not in d:
                raise KeyError(f"[{page}/{lang}] clé manquante : {k}")
            el[attr] = d[k]
        del el["data-i18n-attr"]
    out = tidy_links(str(soup))
    if not out.startswith("<!DOCTYPE"):
        out = "<!DOCTYPE html>\n" + out
    return out


def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, "w", encoding="utf-8").write(content)


def main():
    n = 0
    for page, (fname, _) in PAGES.items():
        for lang in LANGS:
            write((PREFIX[lang].strip("/") + "/" if lang != "en" else "") + fname, render(page, lang))
            n += 1

    # sitemap (accueil ×3 avec hreflang)
    lastmod = "2026-10-06"
    entries = ""
    for l in LANGS:
        alts = "".join(f'<xhtml:link rel="alternate" hreflang="{a}" href="{url(a, "index")}"/>' for a in LANGS)
        alts += f'<xhtml:link rel="alternate" hreflang="x-default" href="{url("en", "index")}"/>'
        entries += f"<url><loc>{url(l, 'index')}</loc><lastmod>{lastmod}</lastmod>{alts}</url>\n"
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
          'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + entries + "</urlset>\n")
    write("robots.txt", f"User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: {SITE}/sitemap.xml\n")

    csp = ("default-src 'self'; img-src 'self' data:; font-src 'self'; style-src 'self'; "
           "script-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; "
           "connect-src 'self' https://challenges.cloudflare.com; form-action 'self'; base-uri 'self'; "
           "frame-ancestors 'none'; object-src 'none'")
    write("_headers", f"""/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Strict-Transport-Security: max-age=31536000
  Content-Security-Policy: {csp}

/assets/*
  Cache-Control: public, max-age=2592000

/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
""")

    # 404 trilingue
    write("404.html", """<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>404 — The Collectors Lounge</title><meta name="robots" content="noindex"/>
<link rel="icon" href="/favicon.svg" type="image/svg+xml"/><link rel="stylesheet" href="/styles.css"/><link rel="stylesheet" href="/legal.css"/></head>
<body class="policy-page"><header class="header policy-header"><a class="logo" href="/"><span>THE COLLECTORS LOUNGE</span><small>CITY 32 · MÉRIDA · MEXICO</small></a></header>
<main class="policy-main"><div class="policy-kicker">404</div><h1>Page not found</h1>
<p class="policy-intro">This page does not exist or has moved.<br/>Cette page n’existe pas ou a été déplacée.<br/>Esta página no existe o ha cambiado de lugar.</p>
<div class="policy-nav"><a class="button" href="/">English</a><a class="button" href="/fr/">Français</a><a class="button" href="/es/">Español</a></div></main>
<footer><span>© 2026 THE COLLECTORS LOUNGE</span><span>CITY 32 · MÉRIDA · MEXICO</span></footer></body></html>
""")
    print(f"{n} pages générées + sitemap.xml, robots.txt, _headers, 404.html")


if __name__ == "__main__":
    main()
