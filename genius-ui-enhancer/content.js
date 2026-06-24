(function() {
    'use strict';
    
    // =========================================
    // 0. URL GATEKEEPER
    // =========================================
    // Only execute on lyrics pages or direct annotation links (numbers only).
    const path = window.location.pathname;
    const isLyricsPage = path.endsWith('-lyrics');
    const isAnnotationPage = /^\/\d+$/.test(path);

    if (!isLyricsPage && !isAnnotationPage) {
        return; 
    }

    console.log("[Genius UI Enhancer] Valid page detected. Initializing...");

    // =========================================
    // 1. INJECT CUSTOM CSS
    // =========================================
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --gui-right-panel-width: 400px; 
            --gui-font-size: 24px; 
        }
            
        /* --- ALWAYS ACTIVE: Hide Ads & Clutter --- */
        [class*="PrimisContainer"],
        [class*="InnerSectionDivider"],
        [class*="LyricsSidebarAd"],
        div[id^="div-gpt-ad"],
        #sellwild-widget, [class*="sellwild"],
        [class*="ob-smartfeed-wrapper"], [class*="feedIdx-"],
        div[data-exclude-from-selection="true"],
        div:has(> div > div > div[id^="div-gpt-ad-desktop_song_combined_leaderboard"]),
        div[class*="BottomSticky"],
        [class*="RightSidebar__Container"] {
            display: none !important;
        }

        /* --- ALWAYS ACTIVE: Header & Footer Expansion --- */
        [class*="SongHeader-desktop__RightContainer"] {
            grid-column: header-right-start / grid-end !important;
            width: 100% !important;
        }
        [class*="LyricsFooter__Container"],
        [class*="About__Container"],
        [class*="SongCommentsWithAds__Container"] {
            grid-column-start: grid-start !important;
            grid-column-end: grid-end !important;
            max-width: none !important;
        }

        /* --- STANDARD LAYOUT: Expand grid usage --- */
        [class*="Lyrics__Container"],
        div[data-lyrics-container="true"],
        [class*="StickyToolbar__Left"] {
            grid-column-start: grid-start !important; 
            max-width: none !important;
        }

        [class*="RightSidebar__Container"],
        [class*="ContributorSidebar"],
        [class*="SectionLeaderboard__Container"],
        [class*="AnnotationPortal"] {
            grid-column-end: grid-end !important;
        }

        /* --- CLEAN VIEW: Hide clutter (sidebars, annotations, etc.) and expand lyrics fully --- */
        body.gui-clean-view [class*="RightSidebar__Container"],
        body.gui-clean-view [class*="ContributorSidebar"],
        body.gui-clean-view [class*="SectionLeaderboard__Container"],
        body.gui-clean-view [data-testid*="sticky-contributor-toolbar"],
        body.gui-clean-view [class*="AnnotationPortal"],
        body.gui-clean-view [class*="LyricsHighlightTooltipContainer"] {
            display: none !important;
        }

        body.gui-clean-view [class*="Lyrics__Container"],
        body.gui-clean-view div[data-lyrics-container="true"] {
            grid-column-end: grid-end !important; 
            padding-right: 0 !important; 
        }

        body.gui-clean-view [class*="SectionScrollSentinel__Container"] {
            padding-top: 3rem !important;
        }

        /* CLEAN VIEW: Remove annotation links to allow native text selection */
        body.gui-clean-view [class*="ReferentFragment"] {
            background-color: transparent !important;
            color: inherit !important;
            text-decoration: none !important;
            cursor: text !important;
            pointer-events: auto !important;
            -webkit-user-drag: none !important;
            user-drag: none !important;
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
        }

        /* --- LYRICS ALIGNMENT & FONT SCALING --- */
        body.gui-align-left [class*="Lyrics__Container"],
        body.gui-align-left div[data-lyrics-container="true"] {
            text-align: left !important;
        }
        body.gui-align-center [class*="Lyrics__Container"],
        body.gui-align-center div[data-lyrics-container="true"] {
            text-align: center !important;
        }
        body.gui-align-right [class*="Lyrics__Container"],
        body.gui-align-right div[data-lyrics-container="true"] {
            text-align: right !important;
        }

        /* Enforce dynamic font size on all lyric containers and their nested elements */
        [class*="Lyrics__Container"],
        [class*="Lyrics__Container"] *,
        div[data-lyrics-container="true"],
        div[data-lyrics-container="true"] *,
        [class*="ReferentFragment"],
        [class*="ReferentFragment"] * {
            font-size: var(--gui-font-size) !important;
            line-height: 1.6 !important;
        }

        /* --- UI CONTROL PANEL STYLING --- */
        #gui-controls {
            position: fixed !important;
            bottom: 24px !important;
            right: 24px !important;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 2147483647 !important;
        }

        .gui-row {
            display: flex;
            justify-content: space-between;
            gap: 6px;
        }

        .gui-btn {
            background-color: #ffff64; 
            color: #000; 
            border: 2px solid #000;
            font-family: inherit; 
            font-weight: bold; 
            cursor: pointer;
            border-radius: 50px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.2); 
            transition: all 0.2s ease;
            white-space: nowrap;
        }

        .gui-btn:hover:not(:disabled) {
            background-color: #e5e55a; 
            transform: translateY(-2px); 
            box-shadow: 0 6px 8px rgba(0,0,0,0.3);
        }

        .gui-btn:disabled {
            background-color: #e0e0e0 !important;
            color: #999 !important;
            border-color: #ccc !important;
            cursor: not-allowed !important;
            transform: none !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
            opacity: 0.6;
        }

        .gui-btn-toggle {
            font-size: 0.9rem;
            padding: 8px 16px; 
            width: 100%;
        }

        .gui-btn-align {
            padding: 6px 10px; 
            flex: 1; 
            display: flex;
            justify-content: center; 
            align-items: center;     
        }

        .gui-btn-align img {
            width: 18px;  
            height: 18px;
            object-fit: contain;
            pointer-events: none; 
        }

        #gui-btn-font-dec, #gui-btn-font-inc {
            font-size: 1.1rem;
            font-weight: 900;
        }
    `;
    
    if (document.head) document.head.appendChild(style);
    else document.documentElement.appendChild(style);

    // =========================================
    // 2. EVENT INTERCEPTORS
    // =========================================
    // Safely retrieves the nearest annotation element
    function getAnnotationElement(target) {
        if (!target) return null;
        const element = target.nodeType === 3 ? target.parentElement : target;
        if (element && typeof element.closest === 'function') {
            return element.closest('[class*="ReferentFragment"]');
        }
        return null;
    }

    // Intercepts events in the capture phase to override Genius's React handlers during Clean View
    function handleAnnotationEvent(e, stopPropagationOnly = false) {
        if (document.body && document.body.classList.contains('gui-clean-view')) {
            const annotation = getAnnotationElement(e.target);
            if (annotation) {
                if (!stopPropagationOnly) e.preventDefault();
                e.stopPropagation(); 
            }
        }
    }

    document.addEventListener('click', (e) => handleAnnotationEvent(e), true); 
    document.addEventListener('dragstart', (e) => handleAnnotationEvent(e, true), true);
    document.addEventListener('mousedown', (e) => handleAnnotationEvent(e, true), true);

    // =========================================
    // 3. UI MANAGEMENT
    // =========================================
    function applySavedState() {
        if (!document.body) return;
        
        // Restore View
        if (localStorage.getItem('geniusUiCleanView') === 'true') {
            document.documentElement.classList.add('gui-clean-view');
            document.body.classList.add('gui-clean-view');
        } else {
            document.documentElement.classList.remove('gui-clean-view');
            document.body.classList.remove('gui-clean-view');
        }
        
        // Restore Alignment
        const savedAlignment = localStorage.getItem('geniusUiAlignment');
        document.body.classList.remove('gui-align-left', 'gui-align-center', 'gui-align-right');
        if (savedAlignment) document.body.classList.add(savedAlignment);

        // Restore Font Size
        const savedFontSize = parseInt(localStorage.getItem('geniusUiFontSize')) || 24;
        document.documentElement.style.setProperty('--gui-font-size', savedFontSize + 'px');
    }

    function injectControls() {
        applySavedState();
        if (document.getElementById('gui-controls') || !document.body) return; 
        
        const controlsWrapper = document.createElement('div');
        controlsWrapper.id = 'gui-controls';

        // --- ROW 1: FONT SIZE ---
        const fontRow = document.createElement('div');
        fontRow.className = 'gui-row';

        const btnFontDec = document.createElement('button');
        btnFontDec.className = 'gui-btn gui-btn-align';
        btnFontDec.id = 'gui-btn-font-dec';
        btnFontDec.innerText = '−';

        const btnFontReset = document.createElement('button');
        btnFontReset.className = 'gui-btn gui-btn-align';
        
        const btnFontInc = document.createElement('button');
        btnFontInc.className = 'gui-btn gui-btn-align';
        btnFontInc.id = 'gui-btn-font-inc';
        btnFontInc.innerText = '+';

        const FONT_MIN = 10;
        const FONT_MAX = 48;
        const FONT_DEFAULT = 24;
        let currentFontSize = parseInt(localStorage.getItem('geniusUiFontSize')) || FONT_DEFAULT;

        function updateFontState(size) {
            document.documentElement.style.setProperty('--gui-font-size', size + 'px');
            btnFontDec.disabled = (size <= FONT_MIN);
            btnFontInc.disabled = (size >= FONT_MAX);
            btnFontReset.innerText = size + 'px';
            localStorage.setItem('geniusUiFontSize', size);
            currentFontSize = size;
        }

        btnFontDec.addEventListener('click', (e) => { e.preventDefault(); if (currentFontSize > FONT_MIN) updateFontState(currentFontSize - 2); });
        btnFontInc.addEventListener('click', (e) => { e.preventDefault(); if (currentFontSize < FONT_MAX) updateFontState(currentFontSize + 2); });
        btnFontReset.addEventListener('click', (e) => { e.preventDefault(); updateFontState(FONT_DEFAULT); });

        updateFontState(currentFontSize);
        fontRow.append(btnFontDec, btnFontReset, btnFontInc);

        // --- ROW 2: ALIGNMENT ---
        const alignRow = document.createElement('div');
        alignRow.className = 'gui-row';

        function setAlignment(alignmentClass) {
            document.body.classList.remove('gui-align-left', 'gui-align-center', 'gui-align-right');
            if (alignmentClass) {
                document.body.classList.add(alignmentClass);
                localStorage.setItem('geniusUiAlignment', alignmentClass);
            } else {
                localStorage.removeItem('geniusUiAlignment');
            }
        }

        const btnLeft = document.createElement('button');
        btnLeft.className = 'gui-btn gui-btn-align';
        btnLeft.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAOwAAADsAEnxA+tAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAABC9JREFUeJzt3UuLHFUYh/FnxtHIJFEcNBqdQVSiCEK8LNSFmo0iQbyi2Rn1E7h0Ke7UjZ/BXRDFhdkoKqIuBC8wIuIN0cnFTSLGpNUkk7g40+2J0F1TpKfeqlPPD17okAT+nPP2hTp1ToEkSZIkSZKk8s1M+LtNwB3AVcAFzcTRlK0Ch4EvgX/W+5+2Aq8CfwJnrSLqGPAKsIUKVwJftyCwtTG1DGxjjBngoxaEtDa2PmDMV/+jLQhnNVMPr805s/xnD+qL0VznDXBzQBDFGM113gBbA4IoxqXDF7OT/pXKZwP0nA3Qc3kDnApLoaadHL7IG+BAQBDFGM113gDvBQRRjHeHL/JLggvAj8BljcdRk44AO4Df4dxPgKPAM6QlRJVpFdjL2uSP8yBwkPjr1dZ06wDwAP8z7oaQeeBJYBewHW8I6apV4BBplfcNYBAbR5IkSZIkSZIkNW3S7uAl4F7S7uC5ZuJ01gD4nrTo8ndwlvO2CLwJnCF+CbNrdRR4nslvrFa7kbR8GD2QXa/X6UgT5Ov8c8CHwPVBWUqyk3TXzWfRQep4mvh3Tkl1BLi41gwEyO8JfCwsRZkWSD+iWy1vgBvCUpRrR3SAKnkDbA5LUa7KM3miuTew52yAnrMBei5vgM5fwmyhv6IDVMkb4JewFOX6OTpAlbwB9oelKNOAdGW1M+aBX4m/glZKvVRv+NvhLjwjeBr1PnBhzbFvjZ3A58QPYhfrJPAa6aT1Thi3ZDkD3APch7uD12MAfEf6HbUSnEWSJEmSJEmSJGlk3GLQLGlTw3B3sItB3bQK/EbatfwxacNvpVtJDxuOXlq1pltfkJb6J7obON6CsNbG1HHgTjL5V8A8aU17EZVsBbiJtTuW85tCn8PJ74Ml4NnhH/IG2N18FgUZzXXeANcGBFGM64Yv8gZo/WEGmprRXLs3sOdsgJ6zAXoub4ATYSnUtNFc5w3wU0AQxfhh+CJvgLcCgijGaK7zS8FzwFfALY3HUZOWgdtZe0Rw/glwGnicdFSsynQIeIKK50NfTXrMqIdFl1NngH2kjb7nmHSg8SLphpDteFx8V50GDpNuCDkYnEWSJEmSJEmSJAUYtxi0GXiKdFSsu4OrDUh32bwNfBKc5bztJq0gRS9hdrX2A5fXHvWWeIS0hBg9iF2vb4BLao59iPyjfYH0hIv5oCwluYI0nu9EB6njBeLfOSXVKTrwVZDfE3h/WIoyzQG7okNUyRvgmrAU5VqKDlAlb4DOPuOmxS6KDlDFvYE9ZwP0nA2wsc5GB6iSN8CxsBTl+iM6QJW8Ab4NS1Gu1o9p3gD7wlKUaQX4NDpEHTOkS8HRV9BKqT31hr8dtpG2D0cPXtfrxZrj3ipbgJdJP2CiB7JrtQw8VH/I40zaHbwJuA13B6/HCdI5yx6zI0mSJEmSJKmF/gVq4dvnhsRHUAAAAABJRU5ErkJggg==" alt="Left" />';
        btnLeft.addEventListener('click', (e) => { e.preventDefault(); setAlignment('gui-align-left'); });

        const btnCenter = document.createElement('button');
        btnCenter.className = 'gui-btn gui-btn-align';
        btnCenter.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAOwAAADsAEnxA+tAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAABDJJREFUeJzt3UuLXEUUwPH/TCLqzASJQmJeijFBA4KiC3EjiqKiEETxsVPzGdwlG3FnVuJK1A+gohDEjYISBBeKChGE8ZGoiaObKCYxo3Fm4qK629uBnkdPn1t9b/1/cKDDzNQ9VB26O1W36oIkSZIkSZKk9ptY5meXA3cA1wIb6klHI7YI/Ap8Cfyz2j/aBBwGzgIXjVbEGeAlYIYVbAW+HoOEjZg4BmxhgAng6BgkacTGRwz46H90DJIz6on9nTFnkv89hUrRG+tqAezLkIjy6I11tQA2ZUhEeVzVfTG53G+p/SyAwlkAhasWwL/ZslDdLnRfVAvgVIZElEdvrKsF8GGGRJTHB90X1SnBq4Hvgc21p6M6nQb2An9A/zvA78CzpCVEtdMi8AydwR/kIeAX8s9XG6ONU8ADXGLQDSFTwBPAPcA2vCGkqRaBOdIq79vA+bzpSJIkSZIkSZKkui23OzjCNHAvsBu4suZrj7t54Dhp61brFm02AIdwx/Fq4gxwkBatwG4E3iN/xzYtjnT6rvFeJH9nNjVeGKK/1yT6O8A1wEn8vB/WeWAnK9zCtR7RG0MexMFfjylSH4aJLoA9we2XYG9k49EFMBXcfgmmIxt3b2DhLIDCWQCFiy6AVR9OqIH+jmw8ugB+DG6/BCciG4+eCNoO/ERLpjQzWACuIx33GiL6HWAOeD34Gm32KoGDX5dp4HPyz6s3LT6jRfMoM8AbpM2KuTt23GMBeI3gCaCuum8I2Q08AtyIawSXmicd0PE+wV/8JEmSJEmSJElSOQYtBk0Cd3fCZwc31yLwG+mo2E+ApdX80W2khw3nXhY1RhtfALeygruAc2OQrBET54A7qah+BEwBs6TNiGqvk8BNpPsP+u4JPICDX4JdwHPdf1QL4OH6c1EmvbGuFsD1GRJRHjd0X1QL4IoMiSiP3li7N7BwFkDhLIDCVQvgr2xZqG69sa4WwA8ZElEe33VfVAvg3QyJKI/eWFengjcCXwG31J6O6nQMuJ3OI4Kr7wALwGOkLd1qpzngcVZ4PvR20mNGl8i/emWMJpaAN0mPAe6z3O7gnaQbQrbhCR9NtUA6YOIo6YHgkiRJkiRJkiSpMHUfFXsfsJ90X7pHxfabJx0Re4T0/OBW2UFakcq9LNqU+Ji0LN8KW0lPDsndqU2LE8CWtXf3+HmH/J3Z1HhriP5ek+jvAHuAb2u4TltdJPXh8agLRG8MuR8Hfz0mSH0YJroAdgS3X4JdkY1HF8Blwe2XILQP3RtYOAugcBZA4aIL4Gxw+yX4M7Lx6AL4Jrj9EoT2YfT/0WeAn4HNwddpq9Okw7vCzm6IPgP4Ail5j6AbzvPAp7mTGIVXyD+v3rR4eaieHmNPk9YFcnfsuMcs8OSQfbxmOebpbyYtcHhDSL950tEts7kTkSRJkiRJktQ2/wHn2xHNkm8MVwAAAABJRU5ErkJggg==" alt="Center" />';
        btnCenter.addEventListener('click', (e) => { e.preventDefault(); setAlignment('gui-align-center'); });

        const btnRight = document.createElement('button');
        btnRight.className = 'gui-btn gui-btn-align';
        btnRight.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAOwAAADsAEnxA+tAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAABB1JREFUeJzt3UuLHUUUwPH/jCGJiSEovmISRMwggqIoKIIaXShBSfCBCCL4AD9APoWgO7cudRMVd7pQVKJxJUaYgCIqKpmZuImvicbozMRFTbc9I3euF+/t01X9/8GBCpPAyakz90JXVRdIkiRJkiRJKt/UBj/bAtwKXAlc0E46GrNl4BRwHDj3X//RDuBFYBE4bxQRvwIvABcxxBXAiQ4kbEwmZoHLGWAKONqBJI3JxvsM+Op/qAPJGe3EodU5Z5p/PI76op7rZgNcH5CIYtRz3WyAHQGJKMbOajC90d9S+WyAnrMBeq7ZAH+FZaG2/VkNmg0wF5CIYtRz3WyAdwMSUYx3qkHzkeAlwNfAxa2nozadBmaAn2DtJ8CPwNOkJUSVaRl4itXJH+QAME/882pjvDEH3M86gzaEbAMeA+4BduGGkFwtAwukVd7Xgd9j05EkSZIkSZIkSW3b6HRwV20lLVLNkBatNNgS8APwIXAyOJf/bQo4TNq3EL20mlusAG8Au0euekdMAa8SX8jcYx7YN2LtO+Ew8cUrJWaBTaOVP9aF+LE/7niyKm4OB0P240bVcXu4GuTQAFl+Z3XcTDXIoQG2RydQoLqmOTSAJsgG6DkboOdyaIA/ohMoUF3THBrgu+gECvRtNcihAT4AzkYnUZi3qkEOR77OkVb97opOpBDfA8+RVgqzsZn0SRD9CDX3WARuG7H2nbEFeIn0epPoQuYYnwA3ri9qjhtC9gIPAtfhhpBhmqeDj5EaQZIkSZIkSZIk9cigxaBp4O7V8O7gfC2TTgcfBT4iHRId6mbSZcPRy5fGeONT4CaGuAM404FkjcnEGeB2GppfAduAL4E9qGQnSXspzsLaTaHP4uT3wV7gmeoPzQZ4oP1cFKSe62YDXB2QiGJcUw2aDbA1IBHFqOc6h4MhmiAboOdsgJ5rNsBvYVmobfVcNxvgm4BEFOOratBsgDcDElGMeq6bj4I3AZ8BN7Sejto0C9zC6hXBzU+AJeAR0lkylWkBeJQh90NfRbpmdIX41StjPLECHCFdA7zGRqeD95A2hOwis3fLqrYEnCJtCJkPzkWSJEmSJEmSJAXI8VWxd5KuPduHr4odpnk6+DUy3/Z3KfA28UurucYCcGDkqnfETuBz4ouYeywBB0esfSe8THzxSonTNG5izeHNH5cBr+AZhnGp7mL+GPIo6r24I2nc7qsGOTTA7ugEClS/ByKHBtgcnUCB6prm0ACaIBug53JogPPRCZQshwZYjE6gQD9Xgxwa4IvoBApU1zSHBjgGzEUnUZgj0QmM6gniH6GWEu/RWAXO4VEwwAlSrvujE8ncLHCIjJeFD5KaIfq3KLf4BXge2L6+oDluCAG4lvS+23/9h7RGdTr4OOnSbUmSJEmSJEm99DejHZFcm6brRAAAAABJRU5ErkJggg==" alt="Right" />';
        btnRight.addEventListener('click', (e) => { e.preventDefault(); setAlignment('gui-align-right'); });

        alignRow.append(btnLeft, btnCenter, btnRight);

        // --- ROW 3: TOGGLE VIEW ---
        const btnToggle = document.createElement('button');
        btnToggle.className = 'gui-btn gui-btn-toggle';
        btnToggle.innerText = 'Toggle View';
        
        btnToggle.addEventListener('click', (e) => {
            e.preventDefault(); 
            const isHidden = document.documentElement.classList.toggle('gui-clean-view');
            document.body.classList.toggle('gui-clean-view');
            localStorage.setItem('geniusUiCleanView', isHidden);
        });

        controlsWrapper.append(fontRow, alignRow, btnToggle);
        document.body.appendChild(controlsWrapper);
    }

    // =========================================
    // 4. OBSERVER
    // =========================================
    // Debounce the observer to prevent lag during rapid React DOM updates
    let observerTimeout;
    const observer = new MutationObserver(() => {
        clearTimeout(observerTimeout);
        observerTimeout = setTimeout(injectControls, 100);
    });
    
    observer.observe(document.documentElement, { childList: true, subtree: true });
    injectControls();

})();