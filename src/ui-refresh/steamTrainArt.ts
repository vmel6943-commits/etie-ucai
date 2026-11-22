/** An original, self-contained SVG engraving used on the ticket and its PNG. */
const engraving = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 210">
<defs>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#f0d59d"/><stop offset=".5" stop-color="#c8a260"/><stop offset="1" stop-color="#e6c98f"/>
  </linearGradient>
</defs>
<g fill="none" stroke="url(#gold)" stroke-linecap="round" stroke-linejoin="round">
  <g stroke-width="3">
    <path d="M30 172h417M58 180h362M76 164h329" opacity=".65"/>
    <path d="M80 137h300l-10 18H89z"/>
    <path d="M103 77h184v55H98V83a6 6 0 0 1 5-6z"/>
    <path d="M95 79V66h34l7 11M106 65l-4-16h31l-4 16M101 49h34"/>
    <path d="M147 77V68h46v9M157 67V55h26v12M153 55h34"/>
    <path d="M265 77V52l22-18h57l14 18v85h-78V77z"/>
    <path d="M276 53h71M287 40h52M284 63h24v29h-24zM317 63h26v29h-26z"/>
    <path d="M360 102h38v35h-38M367 109h26M88 98H68v40h24M67 132l-29 24h52"/>
    <path d="M44 151h33M51 144h21M57 138h12M109 86h147M109 94h147" opacity=".75"/>
    <path d="M112 108h142M119 114h128M369 117h19M103 126h157" opacity=".65"/>
    <circle cx="142" cy="145" r="24"/><circle cx="220" cy="145" r="24"/><circle cx="301" cy="145" r="24"/>
    <circle cx="142" cy="145" r="17"/><circle cx="220" cy="145" r="17"/><circle cx="301" cy="145" r="17"/>
    <circle cx="142" cy="145" r="4"/><circle cx="220" cy="145" r="4"/><circle cx="301" cy="145" r="4"/>
    <path d="M142 128v34m-17-17h34m61-17v34m-17-17h34m64-17v34m-17-17h34"/>
    <path d="M146 147l69 4 79-4M220 145l-9-12M301 145l-9-12"/>
    <path d="M111 43c-8-6-6-13 2-15 8-1 10 4 17 1 4-2 3-6 1-8 8 0 14 3 14 8m2-9c2-8 10-11 17-8 4 2 5 6 12 4 4-1 7-5 7-9" opacity=".8"/>
  </g>
  <g stroke-width="2" opacity=".8">
    <path d="M16 97h24M28 85v24M420 72h22M431 61v22M397 38h12M403 32v12"/>
    <path d="M30 113h44M390 53h39M92 185h276"/>
    <circle cx="67" cy="50" r="2"/><circle cx="385" cy="91" r="2"/><circle cx="430" cy="121" r="2"/>
  </g>
</g>
</svg>`;

/** The light ticket needs darker engraved lines; dark tickets keep antique gold. */
export function steamTrainSrc(style: number): string {
  const artwork = style === 1
    ? engraving.split('#f0d59d').join('#526671').split('#c8a260').join('#324c58').split('#e6c98f').join('#86693e')
    : engraving;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(artwork);
}
