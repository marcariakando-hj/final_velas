import { Layer2D } from "../types";

// SVG data URI generator helper for sample transparent layers
const createSvgDataUrl = (svgContent: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
};

// 1. Santuario de Lavanda / Virgen Esculpida - 4 Capas Superpuestas
export const SANTUARIO_VIRGEN_LAYERS: Layer2D[] = [
  {
    id: "layer-santuario-base",
    name: "1. Base & Vaso de Vidrio Fino",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <!-- Vaso de vidrio cilíndrico con reflejos -->
        <defs>
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.7)" />
            <stop offset="15%" stop-color="rgba(230,225,215,0.3)" />
            <stop offset="50%" stop-color="rgba(255,255,255,0.1)" />
            <stop offset="85%" stop-color="rgba(230,225,215,0.3)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.7)" />
          </linearGradient>
          <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#C5B39E" />
            <stop offset="50%" stop-color="#EADBCC" />
            <stop offset="100%" stop-color="#B2A08B" />
          </linearGradient>
        </defs>
        
        <!-- Contorno del vaso lateral -->
        <path d="M 70 290 Q 125 302 175 290 L 165 410 Q 125 422 80 410 Z" fill="url(#glassGrad)" stroke="url(#rimGrad)" stroke-width="2.5" opacity="0.9" />
        
        <!-- Borde superior del vaso -->
        <ellipse cx="122.5" cy="290" rx="52.5" ry="12" fill="none" stroke="url(#rimGrad)" stroke-width="2" />
        
        <!-- Base inferior gruesa del vaso -->
        <path d="M 80 405 Q 125 418 165 405 L 163 416 Q 125 428 82 416 Z" fill="rgba(215,205,190,0.4)" />
      </svg>
    `),
    colorable: false,
    zIndex: 0,
    type: "frasco",
  },
  {
    id: "layer-santuario-cera",
    name: "2. Cera Líquida del Vaso",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <defs>
          <linearGradient id="waxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FAF7F2" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#E2D7C8" stop-opacity="0.95" />
          </linearGradient>
        </defs>
        <!-- Relleno de cera del vaso -->
        <path d="M 74 296 Q 125 308 171 296 L 162 404 Q 125 416 83 404 Z" fill="url(#waxGrad)" />
        <!-- Menisco superior de la cera -->
        <ellipse cx="122.5" cy="296" rx="48.5" ry="9" fill="#FFFFFF" opacity="0.4" />
      </svg>
    `),
    colorable: true,
    zIndex: 1,
    type: "cera",
  },
  {
    id: "layer-santuario-manto",
    name: "3. Túnica & Manto de la Virgen Esculpida",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <defs>
          <linearGradient id="sculptureGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FAF7F2" />
            <stop offset="50%" stop-color="#EBE3D7" />
            <stop offset="100%" stop-color="#D6C8B5" />
          </linearGradient>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.25"/>
          </filter>
        </defs>
        
        <!-- Figura de la Virgen con silueta esculpida -->
        <g filter="url(#softShadow)">
          <!-- Cabeza / Velo Superior -->
          <path d="M 230 110 C 210 110 200 135 200 160 C 195 190 200 230 195 280 C 190 320 185 360 180 410 C 220 418 280 418 320 410 C 315 360 310 320 305 280 C 300 230 305 190 300 160 C 300 135 290 110 270 110 Z" fill="url(#sculptureGrad)" stroke="#C4B5A0" stroke-width="1.5" />
          
          <!-- Pliegues del Manto / Túnica -->
          <path d="M 215 160 Q 235 220 230 300 Q 225 360 215 412" fill="none" stroke="#B8A892" stroke-width="2" opacity="0.6" />
          <path d="M 285 160 Q 265 220 270 300 Q 275 360 285 412" fill="none" stroke="#B8A892" stroke-width="2" opacity="0.6" />
          <path d="M 250 200 L 250 414" fill="none" stroke="#B8A892" stroke-width="1.5" opacity="0.5" stroke-dasharray="2 2" />
          
          <!-- Rostro y manos unidas en oración -->
          <ellipse cx="250" cy="155" rx="14" ry="18" fill="#F4EDE4" stroke="#C4B5A0" stroke-width="1" />
          <!-- Manos en oración -->
          <path d="M 244 215 C 244 205 256 205 256 215 C 254 225 246 225 244 215 Z" fill="#F8F3EC" stroke="#C4B5A0" stroke-width="1.2" />
        </g>
      </svg>
    `),
    colorable: true,
    zIndex: 2,
    type: "figura",
  },
  {
    id: "layer-santuario-aureola",
    name: "4. Aureola & Corazón en Pan de Oro",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFE89E" />
            <stop offset="50%" stop-color="#D4AF37" />
            <stop offset="100%" stop-color="#996515" />
          </linearGradient>
        </defs>
        
        <!-- Aureola radiante en pan de oro con rayos -->
        <circle cx="250" cy="150" r="46" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-dasharray="4 3" />
        <circle cx="250" cy="150" r="40" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.8" />
        
        <!-- Rayos de luz sagrada -->
        <line x1="250" y1="95" x2="250" y2="82" stroke="url(#goldGrad)" stroke-width="2" />
        <line x1="210" y1="110" x2="200" y2="100" stroke="url(#goldGrad)" stroke-width="2" />
        <line x1="290" y1="110" x2="300" y2="100" stroke="url(#goldGrad)" stroke-width="2" />
        <line x1="195" y1="150" x2="182" y2="150" stroke="url(#goldGrad)" stroke-width="2" />
        <line x1="305" y1="150" x2="318" y2="150" stroke="url(#goldGrad)" stroke-width="2" />
        
        <!-- Sagrado Corazón dorado en relieve en el pecho -->
        <path d="M 250 240 C 245 230 236 232 236 242 C 236 252 250 262 250 262 C 250 262 264 252 264 242 C 264 232 255 230 250 240 Z" fill="url(#goldGrad)" stroke="#B8860B" stroke-width="1.5" />
        <!-- Cruz sobre el corazón -->
        <line x1="250" y1="231" x2="250" y2="238" stroke="url(#goldGrad)" stroke-width="1.5" />
        <line x1="247" y1="234" x2="253" y2="234" stroke="url(#goldGrad)" stroke-width="1.5" />
      </svg>
    `),
    colorable: false,
    zIndex: 3,
    type: "otro",
  },
];

// 2. Zorro del Bosque - 3 Capas Superpuestas
export const ZORRO_BOSQUE_LAYERS: Layer2D[] = [
  {
    id: "layer-zorro-vaso",
    name: "1. Vaso de Cristal & Entorno",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <defs>
          <linearGradient id="zorroGlass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.7)" />
            <stop offset="20%" stop-color="rgba(220,215,205,0.2)" />
            <stop offset="80%" stop-color="rgba(220,215,205,0.2)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.7)" />
          </linearGradient>
        </defs>
        <!-- Vaso ancho -->
        <path d="M 80 270 Q 140 282 200 270 L 190 395 Q 140 408 90 395 Z" fill="url(#zorroGlass)" stroke="#C5B39E" stroke-width="2" />
        <ellipse cx="140" cy="270" rx="60" ry="12" fill="none" stroke="#C5B39E" stroke-width="1.8" />
      </svg>
    `),
    colorable: false,
    zIndex: 0,
    type: "frasco",
  },
  {
    id: "layer-zorro-cuerpo",
    name: "2. Escultura del Zorro en Cera",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <defs>
          <linearGradient id="foxBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FAF7F2" />
            <stop offset="60%" stop-color="#E8DEC9" />
            <stop offset="100%" stop-color="#CBBCA5" />
          </linearGradient>
        </defs>
        <!-- Cera del vaso -->
        <path d="M 84 275 Q 140 287 196 275 L 187 390 Q 140 402 93 390 Z" fill="url(#foxBodyGrad)" />
        
        <!-- Figura del Zorro durmiente enroscado a la derecha -->
        <!-- Cola enroscada -->
        <path d="M 210 380 C 180 340 220 270 270 250 C 330 230 360 280 350 340 C 340 390 270 410 210 380 Z" fill="url(#foxBodyGrad)" stroke="#B8A78F" stroke-width="1.8" />
        <!-- Cabeza apoyada sobre patas -->
        <ellipse cx="265" cy="275" rx="35" ry="25" fill="url(#foxBodyGrad)" stroke="#B8A78F" stroke-width="1.5" />
        <!-- Orejas triangulares -->
        <polygon points="245,255 235,230 260,250" fill="url(#foxBodyGrad)" stroke="#B8A78F" stroke-width="1.5" />
        <polygon points="280,252 295,228 290,255" fill="url(#foxBodyGrad)" stroke="#B8A78F" stroke-width="1.5" />
      </svg>
    `),
    colorable: true,
    zIndex: 1,
    type: "cera",
  },
  {
    id: "layer-zorro-detalles",
    name: "3. Puntas de Cola, Ojos & Relieves",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <!-- Punta blanca de la cola del zorro -->
        <path d="M 210 380 C 195 365 205 340 225 335 C 220 360 225 375 210 380 Z" fill="#FFFFFF" opacity="0.9" stroke="#B8A78F" stroke-width="1.2" />
        <!-- Ojos cerrados durmientes (arcos finos) -->
        <path d="M 252 278 Q 257 283 262 278" fill="none" stroke="#5A4E40" stroke-width="2" stroke-linecap="round" />
        <path d="M 272 277 Q 277 282 282 277" fill="none" stroke="#5A4E40" stroke-width="2" stroke-linecap="round" />
        <!-- Hocico -->
        <circle cx="266" cy="288" r="2.5" fill="#423D33" />
        <!-- Bigotes sutiles -->
        <line x1="258" y1="288" x2="245" y2="286" stroke="#8C7A6B" stroke-width="1" />
        <line x1="258" y1="291" x2="246" y2="293" stroke="#8C7A6B" stroke-width="1" />
        <line x1="274" y1="288" x2="287" y2="286" stroke="#8C7A6B" stroke-width="1" />
        <line x1="274" y1="291" x2="286" y2="293" stroke="#8C7A6B" stroke-width="1" />
      </svg>
    `),
    colorable: false,
    zIndex: 2,
    type: "otro",
  },
];

// 3. Abrazo de Osito - 3 Capas Superpuestas
export const OSITO_ABRAZO_LAYERS: Layer2D[] = [
  {
    id: "layer-osito-vaso",
    name: "1. Vaso Artesanal Cerámico",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <defs>
          <linearGradient id="ceramicGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#EFE8DD" />
            <stop offset="50%" stop-color="#FAF7F2" />
            <stop offset="100%" stop-color="#DDD4C5" />
          </linearGradient>
        </defs>
        <path d="M 75 285 Q 130 298 185 285 L 175 415 Q 130 428 85 415 Z" fill="url(#ceramicGrad)" stroke="#B8A892" stroke-width="2" />
        <ellipse cx="130" cy="285" rx="55" ry="12" fill="#E8DEC9" stroke="#B8A892" stroke-width="1.8" />
      </svg>
    `),
    colorable: false,
    zIndex: 0,
    type: "frasco",
  },
  {
    id: "layer-osito-cuerpo",
    name: "2. Escultura del Osito en Cera",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <defs>
          <linearGradient id="bearBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FAF7F2" />
            <stop offset="50%" stop-color="#EAE0D0" />
            <stop offset="100%" stop-color="#CBBCA5" />
          </linearGradient>
        </defs>
        <!-- Cera del vaso -->
        <path d="M 79 290 Q 130 302 181 290 L 173 408 Q 130 420 87 408 Z" fill="url(#bearBodyGrad)" />
        
        <!-- Silueta del osito sentado abrazando una vela -->
        <!-- Cuerpo -->
        <ellipse cx="250" cy="310" rx="55" ry="65" fill="url(#bearBodyGrad)" stroke="#B8A78F" stroke-width="1.8" />
        <!-- Cabeza -->
        <circle cx="250" cy="205" r="45" fill="url(#bearBodyGrad)" stroke="#B8A78F" stroke-width="1.8" />
        <!-- Orejas redondeadas -->
        <circle cx="215" cy="170" r="16" fill="url(#bearBodyGrad)" stroke="#B8A78F" stroke-width="1.5" />
        <circle cx="285" cy="170" r="16" fill="url(#bearBodyGrad)" stroke="#B8A78F" stroke-width="1.5" />
        <!-- Brazos abrazando -->
        <path d="M 205 280 C 190 310 230 340 250 330 C 270 340 310 310 295 280" fill="none" stroke="#B8A78F" stroke-width="6" stroke-linecap="round" />
      </svg>
    `),
    colorable: true,
    zIndex: 1,
    type: "cera",
  },
  {
    id: "layer-osito-detalles",
    name: "3. Ojos, Nariz de Botón & Lazito",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <!-- Ojos dulces -->
        <circle cx="236" cy="200" r="3.5" fill="#3D342A" />
        <circle cx="264" cy="200" r="3.5" fill="#3D342A" />
        <circle cx="237" cy="198" r="1" fill="#FFFFFF" />
        <circle cx="265" cy="198" r="1" fill="#FFFFFF" />
        <!-- Hocico en relieve -->
        <ellipse cx="250" cy="214" rx="14" ry="10" fill="#FFFDF9" stroke="#C4B5A0" stroke-width="1" />
        <polygon points="247,210 253,210 250,214" fill="#5A4E40" />
        <path d="M 250 214 L 250 220" stroke="#5A4E40" stroke-width="1.2" />
        <!-- Lazito o detalle corazón -->
        <path d="M 250 252 C 246 244 238 245 238 253 C 238 261 250 268 250 268 C 250 268 262 261 262 253 C 262 245 254 244 250 252 Z" fill="#D49B55" stroke="#B87F3B" stroke-width="1" />
      </svg>
    `),
    colorable: false,
    zIndex: 2,
    type: "otro",
  },
];

// 4. Flor de Loto Sagrada - 3 Capas
export const FLOR_LOTO_LAYERS: Layer2D[] = [
  {
    id: "layer-loto-vaso",
    name: "1. Vaso de Cristal Ámbar Pulido",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <defs>
          <linearGradient id="amberGlass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(212,155,85,0.7)" />
            <stop offset="50%" stop-color="rgba(247,235,215,0.3)" />
            <stop offset="100%" stop-color="rgba(212,155,85,0.7)" />
          </linearGradient>
        </defs>
        <path d="M 70 290 Q 130 305 190 290 L 180 415 Q 130 425 80 415 Z" fill="url(#amberGlass)" stroke="#B87F3B" stroke-width="2" />
        <ellipse cx="130" cy="290" rx="60" ry="12" fill="none" stroke="#B87F3B" stroke-width="1.8" />
      </svg>
    `),
    colorable: false,
    zIndex: 0,
    type: "frasco",
  },
  {
    id: "layer-loto-petalos",
    name: "2. Pétalos de Loto Esculpidos",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <defs>
          <linearGradient id="lotusGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FAF7F2" />
            <stop offset="100%" stop-color="#D6C8B5" />
          </linearGradient>
        </defs>
        <!-- Relleno cera -->
        <path d="M 75 295 Q 130 308 185 295 L 176 410 Q 130 422 84 410 Z" fill="url(#lotusGrad)" />
        
        <!-- Flor de loto geométrica -->
        <g transform="translate(250, 290)">
          <!-- Pétalo central -->
          <path d="M 0 -80 C -25 -40 -30 0 0 20 C 30 0 25 -40 0 -80 Z" fill="url(#lotusGrad)" stroke="#B8A78F" stroke-width="1.5" />
          <!-- Pétalos laterales izquierdos -->
          <path d="M -20 -65 C -55 -30 -50 10 -15 20 C 5 10 -5 -35 -20 -65 Z" fill="url(#lotusGrad)" stroke="#B8A78F" stroke-width="1.5" />
          <path d="M -45 -40 C -75 -10 -60 20 -25 25 C -5 20 -20 0 -45 -40 Z" fill="url(#lotusGrad)" stroke="#B8A78F" stroke-width="1.5" />
          <!-- Pétalos laterales derechos -->
          <path d="M 20 -65 C 55 -30 50 10 15 20 C -5 10 5 -35 20 -65 Z" fill="url(#lotusGrad)" stroke="#B8A78F" stroke-width="1.5" />
          <path d="M 45 -40 C 75 -10 60 20 25 25 C 5 20 20 0 45 -40 Z" fill="url(#lotusGrad)" stroke="#B8A78F" stroke-width="1.5" />
        </g>
      </svg>
    `),
    colorable: true,
    zIndex: 1,
    type: "cera",
  },
  {
    id: "layer-loto-oro",
    name: "3. Filigrana & Detalles en Oro",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <g transform="translate(250, 290)">
          <!-- Pistilos dorados -->
          <circle cx="0" cy="5" r="8" fill="#D4AF37" opacity="0.9" />
          <circle cx="-10" cy="0" r="4" fill="#D4AF37" opacity="0.8" />
          <circle cx="10" cy="0" r="4" fill="#D4AF37" opacity="0.8" />
          <line x1="0" y1="-80" x2="0" y2="-10" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="2 3" />
        </g>
      </svg>
    `),
    colorable: false,
    zIndex: 2,
    defaultColorHex: "#D4AF37",
    type: "otro",
  },
];

// 5. Panda de Bambú - Multizona con Control Independiente de Capas (Cuerpo claro & Manchas oscuras)
export const PANDA_BAMBU_LAYERS: Layer2D[] = [
  {
    id: "layer-panda-vaso",
    name: "1. Vaso Cerámico Artesanal",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <defs>
          <linearGradient id="ceramicGradPanda" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#EBE4D8" />
            <stop offset="50%" stop-color="#FAF7F2" />
            <stop offset="100%" stop-color="#D8CEBD" />
          </linearGradient>
        </defs>
        <path d="M 70 285 Q 130 300 190 285 L 180 415 Q 130 428 80 415 Z" fill="url(#ceramicGradPanda)" stroke="#B8A892" stroke-width="2" />
        <ellipse cx="130" cy="285" rx="60" ry="12" fill="#E2D7C5" stroke="#B8A892" stroke-width="1.8" />
      </svg>
    `),
    colorable: false,
    zIndex: 0,
    defaultColorHex: "#FAF7F2",
    type: "frasco",
  },
  {
    id: "layer-panda-cuerpo",
    name: "2. Cuerpo & Rostro",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <defs>
          <linearGradient id="pandaWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FAF7F2" />
            <stop offset="50%" stop-color="#EDE8DE" />
            <stop offset="100%" stop-color="#D9CFBE" />
          </linearGradient>
        </defs>
        <!-- Cera líquida del vaso -->
        <path d="M 76 292 Q 130 305 184 292 L 176 408 Q 130 420 84 408 Z" fill="url(#pandaWhiteGrad)" />
        
        <!-- Torso del Panda -->
        <ellipse cx="250" cy="305" rx="58" ry="68" fill="url(#pandaWhiteGrad)" stroke="#B2A18A" stroke-width="1.8" />
        
        <!-- Cabeza del Panda -->
        <circle cx="250" cy="195" r="48" fill="url(#pandaWhiteGrad)" stroke="#B2A18A" stroke-width="1.8" />
        
        <!-- Hocico esculpido -->
        <ellipse cx="250" cy="210" rx="18" ry="12" fill="#FFFFFF" stroke="#C5B6A0" stroke-width="1.2" />
      </svg>
    `),
    colorable: true,
    zIndex: 1,
    defaultColorHex: "#FAF7F2",
    allowedColorHexes: ["#FAF7F2", "#EDE8DF", "#E2D9CC", "#DFD5C6", "#D98B68"],
    type: "cera",
  },
  {
    id: "layer-panda-manchas",
    name: "3. Manchas, Orejas & Patas",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <defs>
          <linearGradient id="pandaDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#383533" />
            <stop offset="50%" stop-color="#2A2826" />
            <stop offset="100%" stop-color="#1F1D1C" />
          </linearGradient>
        </defs>
        <!-- Orejas redondeadas oscuras -->
        <circle cx="212" cy="158" r="16" fill="url(#pandaDarkGrad)" stroke="#1A1817" stroke-width="1.5" />
        <circle cx="288" cy="158" r="16" fill="url(#pandaDarkGrad)" stroke="#1A1817" stroke-width="1.5" />
        
        <!-- Parches oscuros en ojos -->
        <ellipse cx="234" cy="192" rx="11" ry="14" transform="rotate(-15 234 192)" fill="url(#pandaDarkGrad)" />
        <ellipse cx="266" cy="192" rx="11" ry="14" transform="rotate(15 266 192)" fill="url(#pandaDarkGrad)" />
        
        <!-- Brazos y hombros oscuros -->
        <path d="M 195 265 C 190 305 220 330 250 325 C 280 330 310 305 305 265 C 315 285 295 345 250 340 C 205 345 185 285 195 265 Z" fill="url(#pandaDarkGrad)" stroke="#1A1817" stroke-width="1.5" />
        
        <!-- Patas delanteras -->
        <ellipse cx="215" cy="305" rx="15" ry="20" fill="url(#pandaDarkGrad)" />
        <ellipse cx="285" cy="305" rx="15" ry="20" fill="url(#pandaDarkGrad)" />
      </svg>
    `),
    colorable: true,
    zIndex: 2,
    defaultColorHex: "#383533",
    allowedColorHexes: ["#383533", "#4A4643", "#6E5B4B", "#8C7A6B", "#D98B68"],
    type: "figura",
  },
  {
    id: "layer-panda-detalles",
    name: "4. Ojos, Nariz & Bambú",
    imageUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
        <!-- Ojos con destello de luz -->
        <circle cx="234" cy="192" r="3.5" fill="#FFFFFF" />
        <circle cx="266" cy="192" r="3.5" fill="#FFFFFF" />
        <circle cx="235" cy="191" r="1.5" fill="#201C19" />
        <circle cx="267" cy="191" r="1.5" fill="#201C19" />
        
        <!-- Nariz triangular y boca -->
        <polygon points="246,206 254,206 250,211" fill="#2A2420" />
        <path d="M 250 211 L 250 216 M 245 215 Q 250 218 255 215" stroke="#2A2420" stroke-width="1.3" fill="none" stroke-linecap="round" />
        
        <!-- Tallo de bambú verde en las manitas -->
        <path d="M 270 270 C 275 295 278 320 280 345" stroke="#5F7A61" stroke-width="5" stroke-linecap="round" fill="none" />
        <line x1="269" y1="292" x2="276" y2="293" stroke="#465C48" stroke-width="2" />
        <line x1="272" y1="318" x2="279" y2="319" stroke="#465C48" stroke-width="2" />
        <path d="M 272 292 C 285 288 295 292 300 290 C 292 296 280 296 272 292 Z" fill="#759877" />
        <path d="M 275 318 C 290 316 298 322 302 320 C 295 325 282 324 275 318 Z" fill="#759877" />
      </svg>
    `),
    colorable: false,
    zIndex: 3,
    defaultColorHex: "#FAF7F2",
    type: "otro",
  },
];

import { SculptedFigure } from "../types";

// Default Sculpted Figures collection for localStorage initialization
export const DEFAULT_SCULPTED_FIGURES: SculptedFigure[] = [
  {
    id: "fig-santuario-virgen",
    name: "Santuario de la Virgen",
    subtitle: "Manto sagrado esculpido con aureola en pan de oro",
    description: "Figura devocional esculpida a mano en cera botánica con túnica plegada y corona resplandeciente.",
    sculptureType: "santuario",
    priceAddon: 6.0,
    layers2D: SANTUARIO_VIRGEN_LAYERS,
    wickX: 31,
    wickY: 59,
    botanicalsX: 31,
    botanicalsY: 62,
    botanicalsRadius: 18,
    waxMaskPolygon: "M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z",
  },
  {
    id: "fig-panda-bambu",
    name: "Panda de Bambú",
    subtitle: "Diseño bicolor con control independiente de orejas & cuerpo",
    description: "Escultura premium de oso panda con capas independientes: cuerpo marfil claro y manchas oscuras de cera mineral personalizable.",
    sculptureType: "panda",
    priceAddon: 5.5,
    layers2D: PANDA_BAMBU_LAYERS,
    wickX: 32,
    wickY: 57,
    botanicalsX: 32,
    botanicalsY: 60,
    botanicalsRadius: 18,
    waxMaskPolygon: "M 20 57 Q 32 60 45 57 L 43 80 Q 32 82 22 80 Z",
  },
  {
    id: "fig-zorro-bosque",
    name: "Zorro del Bosque",
    subtitle: "Zorro durmiente enroscado con cola blanca",
    description: "Escultura botánica de zorro durmiente reposando sobre el lecho de cera de soja con aromas a musgo y pino.",
    sculptureType: "zorro",
    priceAddon: 5.0,
    layers2D: ZORRO_BOSQUE_LAYERS,
    wickX: 35,
    wickY: 55,
    botanicalsX: 35,
    botanicalsY: 58,
    botanicalsRadius: 20,
    waxMaskPolygon: "M 20 54 Q 35 57 50 54 L 47 79 Q 35 81 23 79 Z",
  },
  {
    id: "fig-abrazo-osito",
    name: "Abrazo de Osito",
    subtitle: "Tierno osito sentado con lazo de oro",
    description: "Figura dulce y reconfortante moldeada en cera vegetal, con orejitas esculpidas y detalles artesanales.",
    sculptureType: "osito",
    priceAddon: 5.0,
    layers2D: OSITO_ABRAZO_LAYERS,
    wickX: 32,
    wickY: 57,
    botanicalsX: 32,
    botanicalsY: 60,
    botanicalsRadius: 18,
    waxMaskPolygon: "M 20 57 Q 32 60 45 57 L 43 80 Q 32 82 22 80 Z",
  },
  {
    id: "fig-flor-loto",
    name: "Flor de Loto Sagrada",
    subtitle: "Pétalos concéntricos en relieve zen",
    description: "Simetría botánica y pureza espiritual con pétalos superpuestos y pistilos bañados en polvo de oro.",
    sculptureType: "loto",
    priceAddon: 4.5,
    layers2D: FLOR_LOTO_LAYERS,
    wickX: 33,
    wickY: 58,
    botanicalsX: 33,
    botanicalsY: 61,
    botanicalsRadius: 22,
    waxMaskPolygon: "M 18 58 Q 33 61 47 58 L 45 81 Q 33 83 20 81 Z",
  },
];
