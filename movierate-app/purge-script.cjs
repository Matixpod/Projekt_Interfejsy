const { PurgeCSS } = require('purgecss')
const fs = require('fs')

async function purgeMyCSS() {
  console.log('🧹 Rozpoczynam czyszczenie CSS...')
  
  const purgecss = await new PurgeCSS().purge({
    content: [
      'src/**/*.jsx',
      'src/**/*.js', 
      'public/index.html'
    ],
    css: ['src/App.css'],
    keyframes: true,
    fontFaces: true,
    safelist: [
      'movie-spotlight',
      'community-reviews',
      /^btn-/,
      /^modal-/
    ]
  })
  
  const cleanedCSS = purgecss[0].css
  const originalSize = fs.statSync('src/App.css').size
  const newSize = Buffer.byteLength(cleanedCSS, 'utf8')
  
  fs.writeFileSync('src/App.clean.css', cleanedCSS)
  
  console.log(`📊 Wyniki:`)
  console.log(`   Oryginalny: ${(originalSize/1024).toFixed(2)} KB`)
  console.log(`   Nowy: ${(newSize/1024).toFixed(2)} KB`) 
  console.log(`   Zaoszczędzono: ${((originalSize-newSize)/1024).toFixed(2)} KB`)
}

purgeMyCSS().catch(console.error)
