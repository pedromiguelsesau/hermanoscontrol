import React from 'react';

// Foto 1: Logo Completa com Borda Circular "HERMANO'S CONCEITO — DO BASICO AO BRABO —"
export const HermanosFullLogo: React.FC<{ className?: string }> = ({ className = "h-10 w-10" }) => {
  return (
    <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Black Background Circle */}
      <circle cx="250" cy="250" r="240" fill="#000000" stroke="#FFFFFF" strokeWidth="12" />
      
      {/* Left Face - Rectangular Glasses */}
      <g fill="#FFFFFF">
        {/* Left Glasses Frame */}
        <path d="M120 180 C120 160, 155 160, 175 160 C195 160, 210 165, 210 185 C210 205, 190 215, 170 215 C145 215, 120 205, 120 180 Z" stroke="#FFFFFF" strokeWidth="8" fill="none"/>
        <path d="M130 182 C130 172, 155 172, 170 172 C185 172, 200 175, 200 188 C200 200, 185 206, 168 206 C148 206, 130 198, 130 182 Z" fill="#000000"/>
        
        {/* Right Glasses Frame (Left Person) */}
        <path d="M225 180 C225 165, 240 160, 260 160 C280 160, 300 165, 300 180 C300 205, 280 215, 255 215 C235 215, 225 200, 225 180 Z" stroke="#FFFFFF" strokeWidth="8" fill="none"/>
        <path d="M233 182 C233 172, 246 172, 260 172 C274 172, 290 175, 290 188 C290 200, 276 206, 258 206 C242 206, 233 198, 233 182 Z" fill="#000000"/>
        
        {/* Glasses Bridge & Temples */}
        <rect x="210" y="180" width="15" height="6" fill="#FFFFFF"/>
        <path d="M105 180 L120 180" stroke="#FFFFFF" strokeWidth="6"/>
        <path d="M300 180 L305 180" stroke="#FFFFFF" strokeWidth="6"/>

        {/* Eyebrows */}
        <path d="M130 152 Q165 142 200 152 Q165 148 130 152 Z" fill="#FFFFFF"/>
        <path d="M225 152 Q260 142 295 152 Q260 148 225 152 Z" fill="#FFFFFF"/>

        {/* Mustache & Goatee */}
        <path d="M180 235 Q212 230 245 235 Q235 250 212 258 Q190 250 180 235 Z" fill="#FFFFFF"/>
        <path d="M200 242 Q212 240 224 242 Q212 248 200 242 Z" fill="#000000"/>
        <path d="M190 262 C185 285, 200 300, 212 305 C225 300, 240 285, 235 262 C225 280, 200 280, 190 262 Z" fill="#FFFFFF"/>
        <path d="M202 278 Q212 272 222 278 Q212 292 202 278 Z" fill="#000000"/>
      </g>

      {/* Middle Vertical Divider Line */}
      <line x1="320" y1="140" x2="320" y2="280" stroke="#FFFFFF" strokeWidth="4"/>

      {/* Right Face - Round Glasses & Handlebar Mustache */}
      <g fill="#FFFFFF">
        {/* Round Glasses */}
        <circle cx="380" cy="185" r="32" stroke="#FFFFFF" strokeWidth="8" fill="#000000"/>
        <circle cx="455" cy="185" r="32" stroke="#FFFFFF" strokeWidth="8" fill="#000000"/>
        <line x1="412" y1="185" x2="423" y2="185" stroke="#FFFFFF" strokeWidth="6"/>
        
        {/* Eyebrows */}
        <path d="M352 145 Q380 135 408 145 Q380 140 352 145 Z" fill="#FFFFFF"/>
        <path d="M428 145 Q455 135 482 145 Q455 140 428 145 Z" fill="#FFFFFF"/>

        {/* Mustache */}
        <path d="M375 238 Q418 232 460 238 Q468 258 440 258 Q418 248 395 258 Q368 258 375 238 Z" fill="#FFFFFF"/>
      </g>

      {/* Typography: HERMANO'S CONCEITO */}
      <text x="250" y="360" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="42" letterSpacing="6">
        HERMANO'S
      </text>
      
      <text x="250" y="402" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="24" letterSpacing="12">
        CONCEITO
      </text>

      {/* Subtitle: — DO BASICO AO BRABO — */}
      <text x="250" y="435" textAnchor="middle" fill="#FFFFFF" fontFamily="Arial, Helvetica, sans-serif" fontWeight="600" fontSize="15" letterSpacing="4">
        — DO BASICO AO BRABO —
      </text>
    </svg>
  );
};

// Foto 2: Logo Ícone de Perfil (Apenas o círculo com as duas faces e a borda branca)
export const HermanosIconLogo: React.FC<{ className?: string }> = ({ className = "h-10 w-10" }) => {
  return (
    <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Black Background Circle */}
      <circle cx="250" cy="250" r="235" fill="#000000" stroke="#FFFFFF" strokeWidth="16" />
      
      {/* Left Face - Rectangular Glasses */}
      <g fill="#FFFFFF">
        {/* Left Glasses Frame */}
        <path d="M100 220 C100 195, 140 195, 165 195 C190 195, 205 200, 205 225 C205 250, 180 262, 155 262 C125 262, 100 250, 100 220 Z" stroke="#FFFFFF" strokeWidth="10" fill="none"/>
        <path d="M112 222 C112 210, 140 210, 160 210 C180 210, 194 214, 194 228 C194 242, 178 250, 156 250 C132 250, 112 240, 112 222 Z" fill="#000000"/>
        
        {/* Right Glasses Frame (Left Person) */}
        <path d="M225 220 C225 200, 245 195, 270 195 C295 195, 315 200, 315 220 C315 250, 290 262, 260 262 C235 262, 225 245, 225 220 Z" stroke="#FFFFFF" strokeWidth="10" fill="none"/>
        <path d="M235 222 C235 210, 252 210, 270 210 C288 210, 303 214, 303 228 C303 242, 286 250, 264 250 C246 250, 235 240, 235 222 Z" fill="#000000"/>
        
        {/* Glasses Bridge */}
        <rect x="205" y="220" width="20" height="8" fill="#FFFFFF"/>

        {/* Eyebrows */}
        <path d="M115 185 Q155 172 198 185 Q155 180 115 185 Z" fill="#FFFFFF"/>
        <path d="M225 185 Q268 172 310 185 Q268 180 225 185 Z" fill="#FFFFFF"/>

        {/* Mustache & Goatee */}
        <path d="M170 288 Q210 282 250 288 Q238 308 210 318 Q182 308 170 288 Z" fill="#FFFFFF"/>
        <path d="M192 296 Q210 293 228 296 Q210 304 192 296 Z" fill="#000000"/>
        <path d="M182 322 C175 350, 195 370, 210 376 C225 370, 245 350, 238 322 C228 344, 192 344, 182 322 Z" fill="#FFFFFF"/>
        <path d="M198 342 Q210 334 222 342 Q210 360 198 342 Z" fill="#000000"/>
      </g>

      {/* Middle Vertical Divider Line */}
      <line x1="335" y1="175" x2="335" y2="345" stroke="#FFFFFF" strokeWidth="6"/>

      {/* Right Face - Round Glasses & Handlebar Mustache */}
      <g fill="#FFFFFF">
        {/* Round Glasses */}
        <circle cx="400" cy="228" r="40" stroke="#FFFFFF" strokeWidth="10" fill="#000000"/>
        <circle cx="480" cy="228" r="40" stroke="#FFFFFF" strokeWidth="10" fill="#000000"/>
        <line x1="440" y1="228" x2="440" y2="228" stroke="#FFFFFF" strokeWidth="8"/>
        
        {/* Eyebrows */}
        <path d="M365 178 Q400 165 435 178 Q400 172 365 178 Z" fill="#FFFFFF"/>
        <path d="M445 178 Q480 165 515 178 Q480 172 445 178 Z" fill="#FFFFFF"/>

        {/* Mustache */}
        <path d="M390 292 Q440 285 490 292 Q500 318 468 318 Q440 305 412 318 Q380 318 390 292 Z" fill="#FFFFFF"/>
      </g>
    </svg>
  );
};
