import './style.css'

const THEME_STORAGE_KEY = 'theme'
const THEME_TRANSITION_MS = 550
const themeToggle = document.querySelector('.theme-toggle')

function getStoredTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY)
}

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function isDarkTheme() {
  return document.documentElement.dataset.theme === 'dark'
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function applyTheme(theme, { animate = false } = {}) {
  const dark = theme === 'dark'
  const root = document.documentElement
  const shouldAnimate = animate && !prefersReducedMotion()

  if (shouldAnimate) {
    root.classList.add('theme-transition')
  }

  if (dark) {
    root.dataset.theme = 'dark'
  } else {
    delete root.dataset.theme
  }

  themeToggle?.setAttribute('aria-pressed', String(dark))
  themeToggle?.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode')

  if (shouldAnimate) {
    window.setTimeout(() => {
      root.classList.remove('theme-transition')
    }, THEME_TRANSITION_MS)
  }
}

function initTheme() {
  const stored = getStoredTheme()
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored)
    return
  }

  applyTheme(systemPrefersDark() ? 'dark' : 'light')
}

function toggleTheme() {
  const next = isDarkTheme() ? 'light' : 'dark'
  localStorage.setItem(THEME_STORAGE_KEY, next)
  applyTheme(next, { animate: true })
}

initTheme()
themeToggle?.addEventListener('click', toggleTheme)

const panels = {
  about: document.querySelector('[data-panel="about"]'),
  work: document.querySelector('[data-panel="work"]'),
  services: document.querySelector('[data-panel="services"]'),
}

const panelHashes = {
  about: '#about',
  work: '#my-work',
  services: '#etc',
}

const hashPanels = {
  '#about': 'about',
  '#my-work': 'work',
  '#etc': 'services',
  '#what-i-do': 'services',
  '#work': 'work',
}

const navLinks = document.querySelectorAll('.site-nav [data-nav]')
const panelTriggers = document.querySelectorAll('[data-nav]')
const bracket = document.querySelector('.hand-bracket')
const bracketLeft = document.querySelector('.hand-bracket__left')
const bracketRight = document.querySelector('.hand-bracket__right')
const secretZone = document.querySelector('.secret-easter-egg__zone')
const secretContent = document.querySelector('.secret-easter-egg__content')

const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
const SECRET_PROXIMITY_RADIUS = 320
const SECRET_MOBILE_DELAY_MS = 1200

let secretMobileTimer = null

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function buildBracketPaths(peakX) {
  const x = clamp(peakX, 80, 720)
  const peakY = 2
  const baseY = 33
  const r = (n) => Math.round(n)

  function pinchFrom(pre, cp2x, cp2y, peakX, towardPeak) {
    const tx = pre.x - cp2x
    const ty = pre.y - cp2y
    return {
      cp1: { x: r(pre.x + tx * 0.5), y: r(pre.y + ty * 0.5) },
      cp2: { x: r(peakX - towardPeak * 4), y: peakY + 10 },
    }
  }

  function leftPath() {
    const jaw = { x: r(x - 44), y: 21 }

    if (x >= 260) {
      const cp2 = { x: r(112 + Math.max(0, jaw.x - 112) * 0.14), y: 26 }
      return [
        `M 22,${baseY}`,
        `C 30,28 82,17 120,20`,
        `C 152,23 ${cp2.x},25 ${jaw.x},${jaw.y}`,
        `C ${r(x - 26)},20 ${r(x - 5)},${peakY + 14} ${r(x)},${peakY}`,
      ].join(' ')
    }

    const preJaw = { x: r(x - 28), y: 20 }
    const cp2a = { x: r(preJaw.x - 24), y: 17 }
    const pinch = pinchFrom(preJaw, cp2a.x, cp2a.y, x, 1)
    return [
      `M 22,${baseY}`,
      `C 32,28 ${cp2a.x},${cp2a.y} ${preJaw.x},${preJaw.y}`,
      `C ${pinch.cp1.x},${pinch.cp1.y} ${pinch.cp2.x},${pinch.cp2.y} ${r(x)},${peakY}`,
    ].join(' ')
  }

  function rightPath() {
    const jaw = { x: r(x + 44), y: 21 }

    if (x <= 540) {
      const cp2 = { x: r(688 - Math.max(0, 688 - jaw.x) * 0.14), y: 26 }
      return [
        `M 778,${baseY}`,
        `C 770,28 718,17 680,20`,
        `C 648,23 ${cp2.x},25 ${jaw.x},${jaw.y}`,
        `C ${r(x + 26)},20 ${r(x + 5)},${peakY + 14} ${r(x)},${peakY}`,
      ].join(' ')
    }

    const preJaw = { x: r(x + 28), y: 20 }
    const cp2a = { x: r(preJaw.x + 24), y: 17 }
    const pinch = pinchFrom(preJaw, cp2a.x, cp2a.y, x, -1)
    return [
      `M 778,${baseY}`,
      `C 768,28 ${cp2a.x},${cp2a.y} ${preJaw.x},${preJaw.y}`,
      `C ${pinch.cp1.x},${pinch.cp1.y} ${pinch.cp2.x},${pinch.cp2.y} ${r(x)},${peakY}`,
    ].join(' ')
  }

  return {
    left: leftPath(),
    right: rightPath(),
  }
}

function syncNavLinkWidths() {
  const nav = document.querySelector('.site-header--site .site-nav')
  const workLink = nav?.querySelector('[data-nav="work"]')
  if (!nav || !workLink) return

  nav.style.removeProperty('--nav-link-width')
  const width = Math.ceil(workLink.getBoundingClientRect().width)
  nav.style.setProperty('--nav-link-width', `${width}px`)
}

function activeNavLink() {
  return document.querySelector('.site-nav [data-nav].nav-link--active')
}

const WORK_CLUSTER_MQ = window.matchMedia('(min-width: 40.0625rem)')

function syncBracketWidth() {
  if (!bracket || !panels.work) return

  const onWork = !panels.work.hidden
  if (onWork && WORK_CLUSTER_MQ.matches && panels.work.offsetWidth > 0) {
    bracket.style.width = `${panels.work.offsetWidth}px`
    bracket.style.maxWidth = '100%'
  } else {
    bracket.style.width = ''
    bracket.style.maxWidth = ''
  }
}

function updateBracket() {
  const link = activeNavLink()
  if (!bracket || !bracketLeft || !bracketRight || !link) return

  syncBracketWidth()

  const bracketRect = bracket.getBoundingClientRect()
  const linkRect = link.getBoundingClientRect()
  const peakX = ((linkRect.left + linkRect.width / 2 - bracketRect.left) / bracketRect.width) * 800
  const paths = buildBracketPaths(peakX)

  bracketLeft.setAttribute('d', paths.left)
  bracketRight.setAttribute('d', paths.right)
}

function distanceToRect(x, y, rect) {
  const dx = Math.max(rect.left - x, 0, x - rect.right)
  const dy = Math.max(rect.top - y, 0, y - rect.bottom)
  return Math.hypot(dx, dy)
}

function setSecretOpacity(value) {
  if (!secretContent) return
  secretContent.style.setProperty('--secret-opacity', String(value))
}

function secretProximityOpacity(t) {
  return t * t * t
}

function updateSecretProximity(clientX, clientY) {
  if (!secretZone || panels.work?.hidden) return

  const rect = secretZone.getBoundingClientRect()
  const dist = distanceToRect(clientX, clientY, rect)
  const t = clamp(1 - dist / SECRET_PROXIMITY_RADIUS, 0, 1)
  setSecretOpacity(secretProximityOpacity(t))
}

function clearSecretReveal() {
  if (secretMobileTimer) {
    clearTimeout(secretMobileTimer)
    secretMobileTimer = null
  }
  setSecretOpacity(0)
}

function scheduleSecretReveal() {
  clearSecretReveal()
  if (canHover || panels.work?.hidden) return

  secretMobileTimer = setTimeout(() => {
    setSecretOpacity(1)
    secretMobileTimer = null
  }, SECRET_MOBILE_DELAY_MS)
}

function syncSecretReveal(panelName) {
  if (panelName !== 'work') {
    clearSecretReveal()
    return
  }

  if (canHover) {
    setSecretOpacity(0)
  } else {
    scheduleSecretReveal()
  }
}

function showPanel(name) {
  Object.entries(panels).forEach(([key, panel]) => {
    if (panel) panel.hidden = key !== name
  })

  navLinks.forEach((link) => {
    const active = link.dataset.nav === name
    link.classList.toggle('nav-link--active', active)
    if (active) {
      link.setAttribute('aria-current', 'page')
    } else {
      link.removeAttribute('aria-current')
    }
  })

  requestAnimationFrame(updateBracket)

  syncSecretReveal(name)

  const hash = panelHashes[name] ?? '#about'
  if (location.hash !== hash) {
    history.replaceState(null, '', hash)
  }
}

function panelFromHash() {
  return hashPanels[location.hash] ?? 'about'
}

function guardTextOrphans(node) {
  const text = node.textContent
  const match = text.match(/^(\s*)(.*?)(\s*)$/s)
  if (!match) return

  const [, lead, core, trail] = match
  const words = core.split(/\s+/).filter(Boolean)
  if (words.length < 3) return

  const last = words.pop()
  const next = words.pop()
  const orphanTail = `${next}\u00a0${last}`

  if (words.length > 0 && last.length < 5 && next.length < 5) {
    const third = words.pop()
    node.textContent = `${lead}${[...words, `${third}\u00a0${orphanTail}`].join(' ')}${trail}`
    return
  }

  node.textContent = `${lead}${[...words, orphanTail].join(' ')}${trail}`
}

function preventOrphans(container) {
  if (!container || container.dataset.orphansGuarded) return

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      if (parent.closest('.about-tags')) return NodeFilter.FILTER_REJECT
      if (parent.closest('script, style')) return NodeFilter.FILTER_REJECT
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })

  const textNodes = []
  while (walker.nextNode()) textNodes.push(walker.currentNode)
  textNodes.forEach(guardTextOrphans)

  container.querySelectorAll('.about-tag').forEach((tag) => {
    const tagWalker = document.createTreeWalker(tag, NodeFilter.SHOW_TEXT)
    while (tagWalker.nextNode()) guardTextOrphans(tagWalker.currentNode)
  })

  container.dataset.orphansGuarded = 'true'
}

panelTriggers.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault()
    showPanel(link.dataset.nav)
  })
})

window.addEventListener('hashchange', () => {
  showPanel(panelFromHash())
})

window.addEventListener('resize', () => {
  syncNavLinkWidths()
  updateBracket()
})

if (canHover && secretZone) {
  document.addEventListener('mousemove', (event) => {
    if (!panels.work?.hidden) {
      updateSecretProximity(event.clientX, event.clientY)
    }
  })

  document.addEventListener('mouseleave', () => {
    setSecretOpacity(0)
  })
}

preventOrphans(panels.about)
preventOrphans(panels.services)

syncNavLinkWidths()
showPanel(panelFromHash())

document.fonts?.ready.then(() => {
  syncNavLinkWidths()
  updateBracket()
  measureChyronLoop()
})

const chyronViewport = document.querySelector('.chyron__viewport')
const chyronTrack = document.querySelector('.chyron__track')
const chyronGroup = document.querySelector('.chyron__group')

const CHYRON_SCROLL_PX_PER_SEC = 28

let chyronLoopWidth = 0
let chyronDragging = false
let chyronTouching = false
let chyronDragMoved = false
let chyronDragStartX = 0
let chyronDragScrollLeft = 0
let chyronAutoScrolling = false
let chyronScrollRemainder = 0
let chyronLastTick = 0

function measureChyronLoop() {
  if (!chyronGroup) return
  chyronLoopWidth = chyronGroup.offsetWidth
}

function wrapChyronScroll() {
  if (!chyronViewport || chyronLoopWidth <= 0) return

  if (chyronViewport.scrollLeft >= chyronLoopWidth) {
    chyronViewport.scrollLeft -= chyronLoopWidth
  } else if (chyronViewport.scrollLeft < 0) {
    chyronViewport.scrollLeft += chyronLoopWidth
  }
}

function tickChyron(now) {
  if (!chyronLastTick) chyronLastTick = now
  const elapsed = now - chyronLastTick
  chyronLastTick = now

  if (chyronAutoScrolling && chyronViewport && !chyronDragging && !chyronTouching) {
    chyronScrollRemainder += (CHYRON_SCROLL_PX_PER_SEC * elapsed) / 1000

    if (chyronScrollRemainder >= 1) {
      const step = Math.floor(chyronScrollRemainder)
      chyronViewport.scrollLeft += step
      chyronScrollRemainder -= step
      wrapChyronScroll()
    }
  }

  requestAnimationFrame(tickChyron)
}

function initChyron() {
  if (!chyronViewport || !chyronTrack) return

  measureChyronLoop()
  chyronAutoScrolling = !prefersReducedMotion()
  if (chyronAutoScrolling) requestAnimationFrame(tickChyron)

  chyronViewport.addEventListener(
    'wheel',
    (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

      event.preventDefault()
      chyronViewport.scrollLeft += event.deltaY
      wrapChyronScroll()
    },
    { passive: false },
  )

  chyronViewport.addEventListener('scroll', wrapChyronScroll)

  chyronViewport.addEventListener('touchstart', () => {
    chyronTouching = true
  }, { passive: true })

  chyronViewport.addEventListener('touchend', () => {
    chyronTouching = false
  }, { passive: true })

  chyronViewport.addEventListener('touchcancel', () => {
    chyronTouching = false
  }, { passive: true })

  chyronViewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.pointerType !== 'mouse') return

    chyronDragging = false
    chyronDragMoved = false
    chyronDragStartX = event.clientX
    chyronDragScrollLeft = chyronViewport.scrollLeft
  })

  chyronViewport.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || (event.buttons & 1) === 0) return

    if (!chyronDragging && Math.abs(event.clientX - chyronDragStartX) > 4) {
      chyronDragging = true
      chyronDragMoved = true
      chyronViewport.classList.add('is-dragging')
      chyronViewport.setPointerCapture(event.pointerId)
    }

    if (!chyronDragging) return

    chyronViewport.scrollLeft = chyronDragScrollLeft - (event.clientX - chyronDragStartX)
    wrapChyronScroll()
  })

  function endChyronDrag(event) {
    if (chyronDragging) {
      chyronViewport.classList.remove('is-dragging')

      if (event.pointerId !== undefined && chyronViewport.hasPointerCapture(event.pointerId)) {
        chyronViewport.releasePointerCapture(event.pointerId)
      }
    }

    chyronDragging = false
  }

  chyronViewport.addEventListener('pointerup', endChyronDrag)
  chyronViewport.addEventListener('pointercancel', endChyronDrag)

  chyronViewport.addEventListener(
    'click',
    (event) => {
      if (chyronDragMoved) {
        event.preventDefault()
        event.stopPropagation()
      }
    },
    true,
  )

  chyronViewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      chyronViewport.scrollLeft -= 48
      wrapChyronScroll()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      chyronViewport.scrollLeft += 48
      wrapChyronScroll()
    }
  })

  window.addEventListener('resize', measureChyronLoop)
}

initChyron()
