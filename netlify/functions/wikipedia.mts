
import type { Context } from '@netlify/functions'

// ==========================================
// TYPES
// ==========================================

type Coordonnees = {
  lat: number
  lon: number
}

type PageWikipedia = {
  pageid?: number
  title: string
  missing?: boolean
  extract?: string
  pageimage?: string
  thumbnail?: {
    source: string
  }
  coordinates?: Coordonnees[]
  categories?: Array<{
    title: string
  }>
}

type ResultatGeo = {
  pageid: number
  title: string
}

type ReponseWikipedia = {
  query?: {
    pages?: PageWikipedia[]
    geosearch?: ResultatGeo[]
  }
  error?: {
    info?: string
  }
}

type MetadataImage = {
  auteur: string | null
  licence: string | null
  licenceUrl: string | null
  pageUrl: string | null
  restrictions: string | null
}

type PageFichier = {
  title: string
  missing?: boolean
  imageinfo?: Array<{
    descriptionurl?: string
    extmetadata?: Record<string, { value?: string }>
  }>
}

type ReponseImages = {
  query?: {
    pages?: PageFichier[]
  }
  error?: {
    info?: string
  }
}

type LieuTouristique = {
  id: string
  nom: string
  description: string
  commune: string

  image: string | null
  imageSource: 'wikipedia' | 'aucune'

  imageAuteur: string | null
  imageLicence: string | null
  imageLicenceUrl: string | null
  imagePageUrl: string | null

  wikipediaUrl: string
  latitude: number | null
  longitude: number | null
}

// ==========================================
// CONFIGURATION
// ==========================================

const API_URL =
  'https://fr.wikipedia.org/w/api.php'

const COMMONS_API_URL =
  'https://commons.wikimedia.org/w/api.php'

const USER_AGENT =
  'TravelExplore/0.1 (https://github.com/Abdourazack)'

const RAYON_METRES = 7000
const MAX_LIEUX = 20

// ==========================================
// CRITÈRES TOURISTIQUES
// ==========================================

const motsTouristiques = [
  'musée',
  'musee',
  'château',
  'chateau',
  'palais',
  'basilique',
  'cathédrale',
  'cathedrale',
  'abbaye',
  'église',
  'eglise',
  'chapelle',
  'beffroi',
  'citadelle',
  'forteresse',
  'monument historique',
  'patrimoine',
  'jardin botanique',
  'jardin public',
  'parc public',
  'parc naturel',
  'réserve naturelle',
  'reserve naturelle',
  'lac',
  'cascade',
  'grotte',
  'site archéologique',
  'site archeologique',
  'site historique',
  'lieu de mémoire',
  'lieu de memoire',
  'centre d art',
  'centre culturel',
  'galerie d art',
  'villa historique',
  'maison historique',
  'hôtel de ville historique',
  'hotel de ville historique',
  'pont historique',
  'tour médiévale',
  'tour medievale',
]

const expressionsExclues = [
  /^canton\b/,
  /^gare\b/,
  /^station\b/,
  /^ligne de\b/,
  /^autoroute\b/,
  /^route departementale\b/,
  /^arrondissement\b/,
  /^circonscription\b/,
  /^communaute\b/,
  /^liste de\b/,
  /^elections?\b/,
  /^neuville en ferrain$/,
  /metro de lille/,
  /station de metro/,
  /station de tramway/,
  /gare ferroviaire/,
  /est une commune francaise/,
  /est un ancien canton/,
  /circonscription electorale/,
  /structure intercommunale/,
  /club de football/,
  /centre commercial/,
]

// ==========================================
// OUTILS
// ==========================================

function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-'’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Normalisation spécifique aux fichiers Wikimedia.
// Exemple :
// File:Hôtel_de_ville.jpg
// Fichier:Hôtel de ville.jpg
// deviennent la même clé de comparaison.

function normaliserTitreFichier(
  nom: string
): string {
  return normaliser(nom)
    .replace(/^(file|fichier):\s*/, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function titreFichier(nom: string): string {
  return `File:${nom.replace(
    /^(File|Fichier):/i,
    ''
  )}`
}

function contientMotTouristique(
  texte: string
): boolean {
  const valeur = normaliser(texte)

  return motsTouristiques.some((mot) =>
    valeur.includes(normaliser(mot))
  )
}

function estExclu(
  titre: string,
  description: string
): boolean {
  const titreNormalise = normaliser(titre)
  const descriptionNormalisee =
    normaliser(description)

  return expressionsExclues.some(
    (expression) =>
      expression.test(titreNormalise) ||
      expression.test(descriptionNormalisee)
  )
}

function imageExploitable(
  image: string | undefined
): boolean {
  if (!image) return false

  if (image.toLowerCase().includes('.svg')) {
    return false
  }

  try {
    return new URL(image).protocol === 'https:'
  } catch {
    return false
  }
}

function urlHTTPS(
  valeur: string | undefined
): string | null {
  if (!valeur) return null

  try {
    const url = new URL(valeur)

    return url.protocol === 'https:'
      ? url.toString()
      : null
  } catch {
    return null
  }
}

// Les métadonnées Wikimedia peuvent contenir
// du HTML. On les transforme en texte simple.
// Aucun HTML n'est injecté dans React.

function texteSimple(
  html: string | undefined
): string | null {
  if (!html) return null

  const texte = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(\d+);/g, (_, nombre: string) => {
      const code = Number(nombre)

      return Number.isInteger(code) &&
        code >= 0 &&
        code <= 0x10ffff &&
        !(code >= 0xd800 && code <= 0xdfff)
        ? String.fromCodePoint(code)
        : ''
    })
    .replace(
      /&#x([\da-f]+);/gi,
      (_, nombre: string) => {
        const code = Number.parseInt(
          nombre,
          16
        )

        return Number.isInteger(code) &&
          code >= 0 &&
          code <= 0x10ffff &&
          !(code >= 0xd800 && code <= 0xdfff)
          ? String.fromCodePoint(code)
          : ''
      }
    )
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()

  return texte || null
}

// ==========================================
// CLASSIFICATION DES LIEUX
// ==========================================

function estLieuTouristique(
  page: PageWikipedia
): boolean {
  if (!page.pageid) return false

  const description =
    page.extract?.trim() ?? ''

  if (description.length < 35) {
    return false
  }

  if (!page.coordinates?.length) {
    return false
  }

  if (
    estExclu(
      page.title,
      description
    )
  ) {
    return false
  }

  const categories = (
    page.categories ?? []
  )
    .map((categorie) => categorie.title)
    .join(' ')

  return (
    contientMotTouristique(page.title) ||
    contientMotTouristique(description) ||
    contientMotTouristique(categories)
  )
}

// ==========================================
// COMMUNICATION AVEC LES API
// ==========================================

async function appelerAPI<T>(
  baseUrl: string,
  parametres: Record<string, string>
): Promise<T> {
  const url = new URL(baseUrl)

  url.searchParams.set(
    'action',
    'query'
  )
  url.searchParams.set(
    'format',
    'json'
  )
  url.searchParams.set(
    'formatversion',
    '2'
  )

  for (
    const [cle, valeur] of
    Object.entries(parametres)
  ) {
    url.searchParams.set(
      cle,
      valeur
    )
  }

  const response = await fetch(
    url.toString(),
    {
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
    }
  )

  if (!response.ok) {
    throw new Error(
      `Wikimedia HTTP ${response.status}`
    )
  }

  const data = (
    await response.json()
  ) as T & {
    error?: {
      info?: string
    }
  }

  if (data.error) {
    throw new Error(
      data.error.info ??
        'Erreur API Wikimedia'
    )
  }

  return data
}

function appelerWikipedia(
  parametres: Record<string, string>
) {
  return appelerAPI<ReponseWikipedia>(
    API_URL,
    parametres
  )
}

// ==========================================
// COORDONNÉES DE LA VILLE
// ==========================================

async function trouverCoordonnees(
  ville: string
): Promise<Coordonnees | null> {
  const data = await appelerWikipedia({
    titles: ville,
    redirects: '1',
    prop: 'coordinates',
  })

  const page =
    data.query?.pages?.find(
      (element) =>
        !element.missing &&
        Boolean(
          element.coordinates?.length
        )
    )

  return (
    page?.coordinates?.[0] ?? null
  )
}

// ==========================================
// RECHERCHE GÉOGRAPHIQUE
// ==========================================

async function rechercherArticles(
  coordonnees: Coordonnees
): Promise<ResultatGeo[]> {
  const data = await appelerWikipedia({
    list: 'geosearch',
    gscoord:
      `${coordonnees.lat}|${coordonnees.lon}`,
    gsradius: String(RAYON_METRES),
    gslimit: '50',
  })

  return (
    data.query?.geosearch ?? []
  )
}

// ==========================================
// DESCRIPTIONS ET PHOTOGRAPHIES
// ==========================================

async function chargerDetails(
  articles: ResultatGeo[]
): Promise<PageWikipedia[]> {
  const pages: PageWikipedia[] = []

  for (
    let index = 0;
    index < articles.length;
    index += 20
  ) {
    const groupe = articles.slice(
      index,
      index + 20
    )

    const data = await appelerWikipedia({
      pageids: groupe
        .map((article) =>
          String(article.pageid)
        )
        .join('|'),

      prop:
        'extracts|pageimages|coordinates|categories',

      exintro: '1',
      explaintext: '1',
      exchars: '500',

      // Nom du fichier indispensable
      // pour récupérer les crédits.
      piprop: 'thumbnail|name',
      pithumbsize: '700',

      cllimit: 'max',
    })

    pages.push(
      ...(data.query?.pages ?? [])
    )
  }

  return pages
}

// ==========================================
// MÉTADONNÉES WIKIMEDIA
// ==========================================

function construireMetadonnees(
  page: PageFichier
): MetadataImage | null {
  const info = page.imageinfo?.[0]

  if (!info) return null

  const meta =
    info.extmetadata ?? {}

  return {
    auteur: texteSimple(
      meta.Artist?.value ??
        meta.Attribution?.value
    ),

    licence: texteSimple(
      meta.LicenseShortName?.value ??
        meta.License?.value
    ),

    licenceUrl: urlHTTPS(
      meta.LicenseUrl?.value
    ),

    pageUrl: urlHTTPS(
      info.descriptionurl
    ),

    restrictions: texteSimple(
      meta.Restrictions?.value
    ),
  }
}

// Une image n'est affichée que si
// nous disposons d'informations
// d'attribution suffisantes.
//
// La présence de ces champs ne garantit
// pas à elle seule que tous les usages
// sont autorisés : chaque licence reste
// applicable selon ses conditions.

function attributionSuffisante(
  details: MetadataImage | undefined
): boolean {
  if (!details) return false

  if (
    !details.auteur ||
    !details.licence ||
    !details.pageUrl
  ) {
    return false
  }

  const licence =
    details.licence.toLowerCase()

  const domainePublic =
    licence.includes('public domain') ||
    licence.includes('domaine public') ||
    licence === 'pd-old' ||
    licence === 'pd-us' ||
    licence === 'cc0'

  const creativeCommons =
    licence.startsWith('cc by') ||
    licence.startsWith('cc-by') ||
    licence.startsWith('cc0')

  if (!domainePublic && !creativeCommons) {
    return false
  }

  // Un lien de licence est exigé ici pour
  // les licences Creative Commons autres
  // que CC0, par prudence.

  if (
    creativeCommons &&
    licence !== 'cc0' &&
    !details.licenceUrl
  ) {
    return false
  }

  return true
}

// ==========================================
// RÉCUPÉRER LES CRÉDITS D'UNE API
// ==========================================

async function lireMetadonneesAPI(
  baseUrl: string,
  noms: string[]
): Promise<Map<string, MetadataImage>> {
  const resultat =
    new Map<string, MetadataImage>()

  for (
    let index = 0;
    index < noms.length;
    index += 20
  ) {
    const groupe =
      noms.slice(index, index + 20)

    const data =
      await appelerAPI<ReponseImages>(
        baseUrl,
        {
          titles: groupe
            .map(titreFichier)
            .join('|'),

          prop: 'imageinfo',
          iiprop: 'url|extmetadata',
        }
      )

    for (
      const page of
      data.query?.pages ?? []
    ) {
      if (page.missing) continue

      const details =
        construireMetadonnees(page)

      if (details) {
        resultat.set(
          normaliserTitreFichier(
            page.title
          ),
          details
        )
      }
    }
  }

  return resultat
}

// ==========================================
// RÉCUPÉRER LES CRÉDITS DES PHOTOGRAPHIES
// ==========================================

async function chargerMetadonneesImages(
  pages: PageWikipedia[]
): Promise<Map<string, MetadataImage>> {
  const noms = [
    ...new Set(
      pages
        .filter((page) =>
          imageExploitable(
            page.thumbnail?.source
          )
        )
        .map((page) =>
          page.pageimage
        )
        .filter(
          (nom): nom is string =>
            Boolean(nom)
        )
    ),
  ]

  if (noms.length === 0) {
    return new Map()
  }

  let resultat =
    new Map<string, MetadataImage>()

  // Première recherche :
  // Wikimedia Commons.

  try {
    resultat =
      await lireMetadonneesAPI(
        COMMONS_API_URL,
        noms
      )
  } catch (error) {
    console.warn(
      'Métadonnées Commons indisponibles :',
      error
    )
  }

  // Deuxième recherche :
  // Wikipédia francophone pour
  // les fichiers non trouvés ou
  // sans informations suffisantes.

  const manquants = noms.filter(
    (nom) => {
      const cle =
        normaliserTitreFichier(nom)

      return !attributionSuffisante(
        resultat.get(cle)
      )
    }
  )

  if (manquants.length > 0) {
    try {
      const locaux =
        await lireMetadonneesAPI(
          API_URL,
          manquants
        )

      for (
        const [cle, valeur] of locaux
      ) {
        if (
          attributionSuffisante(valeur) ||
          !resultat.has(cle)
        ) {
          resultat.set(
            cle,
            valeur
          )
        }
      }
    } catch (error) {
      console.warn(
        'Métadonnées Wikipédia indisponibles :',
        error
      )
    }
  }

  return resultat
}

// ==========================================
// CONVERTIR UN ARTICLE EN LIEU
// ==========================================

function transformerLieu(
  page: PageWikipedia,
  ville: string,
  metadonnees:
    Map<string, MetadataImage>
): LieuTouristique {
  const fichier =
    page.pageimage
      ? titreFichier(
          page.pageimage
        )
      : null

  const credit = fichier
    ? metadonnees.get(
        normaliserTitreFichier(
          fichier
        )
      )
    : undefined

  const imageOriginale =
    imageExploitable(
      page.thumbnail?.source
    )
      ? page.thumbnail!.source
      : null

  // Par précaution, pas d'image
  // si nous ne pouvons pas identifier
  // les informations de réutilisation.

  const image =
    imageOriginale &&
    attributionSuffisante(credit)
      ? imageOriginale
      : null

  return {
    id: String(page.pageid),

    nom: page.title,

    description:
      page.extract?.trim() ??
      'Description indisponible',

    commune:
      `${ville} et alentours`,

    image,

    imageSource: image
      ? 'wikipedia'
      : 'aucune',

    imageAuteur: image
      ? credit?.auteur ?? null
      : null,

    imageLicence: image
      ? credit?.licence ?? null
      : null,

    imageLicenceUrl: image
      ? credit?.licenceUrl ?? null
      : null,

    imagePageUrl: image
      ? credit?.pageUrl ?? null
      : null,

    wikipediaUrl:
      `https://fr.wikipedia.org/?curid=${page.pageid}`,

    latitude:
      page.coordinates?.[0]?.lat ??
      null,

    longitude:
      page.coordinates?.[0]?.lon ??
      null,
  }
}

// ==========================================
// FONCTION NETLIFY
// ==========================================

export default async function handler(
  request: Request,
  _context: Context
): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json(
      {
        error:
          'Méthode non autorisée',
      },
      {
        status: 405,
      }
    )
  }

  const url =
    new URL(request.url)

  const recherche =
    url.searchParams
      .get('search')
      ?.trim() || 'Annecy'

  if (recherche.length > 100) {
    return Response.json(
      {
        error:
          'Nom de ville trop long',
      },
      {
        status: 400,
      }
    )
  }

  try {
    // 1. Coordonnées de la ville.

    const coordonnees =
      await trouverCoordonnees(
        recherche
      )

    if (!coordonnees) {
      return Response.json({
        recherche,
        nombre: 0,
        lieux: [],
        message:
          'Coordonnées introuvables pour cette ville.',
      })
    }

    // 2. Articles géolocalisés.

    const articles =
      await rechercherArticles(
        coordonnees
      )

    // 3. Descriptions et images.

    const pages =
      await chargerDetails(
        articles
      )

    // 4. Filtrage touristique.

    const selection = pages
      .filter(estLieuTouristique)
      .filter(
        (page) =>
          normaliser(
            page.title
          ) !==
          normaliser(
            recherche
          )
      )
      .slice(
        0,
        MAX_LIEUX
      )

    // 5. Crédits et licences.

    const metadonnees =
      await chargerMetadonneesImages(
        selection
      )

    // 6. Conversion des résultats.

    const lieux =
      selection.map(
        (page) =>
          transformerLieu(
            page,
            recherche,
            metadonnees
          )
      )

    // 7. Réponse JSON à React.

    return Response.json({
      recherche,
      nombre: lieux.length,
      lieux,
    })
  } catch (error) {
    console.error(
      'Erreur Wikipédia :',
      error
    )

    return Response.json(
      {
        error:
          'Impossible de récupérer les attractions touristiques',
      },
      {
        status: 502,
      }
    )
  }
}
