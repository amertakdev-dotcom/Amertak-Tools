function toggleSidebar() {
    document.getElementById('sidebar')
        ?.classList.toggle('sidebar-open');

    document.getElementById('overlay')
        ?.classList.toggle('hidden');

    document.querySelector(".hamburger-btn")
        ?.classList.toggle("rotate")
}

const navIcons = {
    home: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M13 19H19V9.97815L12 4.53371L5 9.97815V19H11V13H13V19ZM21 20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.48907C3 9.18048 3.14247 8.88917 3.38606 8.69972L11.3861 2.47749C11.7472 2.19663 12.2528 2.19663 12.6139 2.47749L20.6139 8.69972C20.8575 8.88917 21 9.18048 21 9.48907V20Z"></path></svg>',
    login: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M10 17L15 12L10 7V10H3V14H10V17ZM19 3H11C9.89543 3 9 3.89543 9 5V9H11V5H19V19H11V15H9V19C9 20.1046 9.89543 21 11 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"></path></svg>',
    tools: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M5.32943 3.27158C6.56252 2.8332 7.9923 3.10749 8.97927 4.09446C10.1002 5.21537 10.3019 6.90741 9.5843 8.23385L20.293 18.9437L18.8788 20.3579L8.16982 9.64875C6.84325 10.3669 5.15069 10.1654 4.02952 9.04421C3.04227 8.05696 2.7681 6.62665 3.20701 5.39332L5.44373 7.63C6.02952 8.21578 6.97927 8.21578 7.56505 7.63C8.15084 7.04421 8.15084 6.09446 7.56505 5.50868L5.32943 3.27158ZM15.6968 5.15512L18.8788 3.38736L20.293 4.80157L18.5252 7.98355L16.7574 8.3371L14.6361 10.4584L13.2219 9.04421L15.3432 6.92289L15.6968 5.15512ZM8.97927 13.2868L10.3935 14.7011L5.09018 20.0044C4.69966 20.3949 4.06649 20.3949 3.67597 20.0044C3.31334 19.6417 3.28744 19.0699 3.59826 18.6774L3.67597 18.5902L8.97927 13.2868Z"></path></svg>',
    downloader: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.4142 5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H10.4142L12.4142 5ZM4 5V19H20V7H11.5858L9.58579 5H4ZM13 13H16L12 17L8 13H11V9H13V13Z"></path></svg>',
    qr: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16 17V16H13V13H16V15H18V17H17V19H15V21H13V18H15V17H16ZM21 21H17V19H19V17H21ZM3 3H11V11H3ZM5 5V9H9V5ZM13 3H21V11H13ZM15 5V9H19V5ZM3 13H11V21H3ZM5 15V19H9V15ZM18 13H21V15H18ZM6 6H8V8H6ZM6 16H8V18H6ZM16 6H18V8H16Z"></path></svg>',
    pdf: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M5 4H15V8H19V20H5V4ZM3.9985 2C3.44749 2 3 2.44405 3 2.9918V21.0082C3 21.5447 3.44476 22 3.9934 22H20.0066C20.5551 22 21 21.5489 21 20.9925L20.9997 7L16 2H3.9985ZM10.4999 7.5C10.4999 9.07749 10.0442 10.9373 9.27493 12.6534C8.50287 14.3757 7.46143 15.8502 6.37524 16.7191L7.55464 18.3321C10.4821 16.3804 13.7233 15.0421 16.8585 15.49L17.3162 13.5513C14.6435 12.6604 12.4999 9.98994 12.4999 7.5H10.4999ZM11.0999 13.4716C11.3673 12.8752 11.6042 12.2563 11.8037 11.6285C12.2753 12.3531 12.8553 13.0182 13.5101 13.5953C12.5283 13.7711 11.5665 14.0596 10.6352 14.4276C10.7999 14.1143 10.9551 13.7948 11.0999 13.4716Z"></path></svg>',
    translate: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M5 15V17C5 18.0544 5.81588 18.9182 6.85074 18.9945L7 19H10V21H7C4.79086 21 3 19.2091 3 17V15H5ZM18 10L22.4 21H20.245L19.044 18H14.954L13.755 21H11.601L16 10H18ZM17 12.8852L15.753 16H18.245ZM8 2V4H12V11H8V14H6V11H2V4H6V2ZM17 3C19.2091 3 21 4.79086 21 7V9H19V7C19 5.89543 18.1046 5 17 5H14V3ZM6 6H4V9H6ZM10 6H8V9H10Z"></path></svg>',
    speech: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 7H10V17H8ZM4 10H6V14H4ZM12 4H14V20H12ZM16 8H18V16H16ZM20 10H22V14H20ZM2 17H4V19H2ZM2 5H4V7H2ZM20.7134 7.12811L20.4668 7.69379C20.2864 8.10792 19.7136 8.10792 19.5331 7.69379L19.2866 7.12811C18.8471 6.11947 18.0555 5.31641 17.0677 4.87708L16.308 4.53922C15.8973 4.35653 15.8973 3.75881 16.308 3.57612L17.0252 3.25714C18.0384 2.80651 18.8442 1.97373 19.2761 0.930828L19.5293 0.319534C19.7058 -0.106511 20.2942 -0.106511 20.4706 0.319534L20.7238 0.930828C21.1558 1.97373 21.9616 2.80651 22.9748 3.25714L23.6919 3.57612C24.1027 3.75881 24.1027 4.35653 23.6919 4.53922L22.9323 4.87708C21.9445 5.31641 21.1529 6.11947 20.7134 7.12811Z"></path></svg>',
    count: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM5 5V19H19V5ZM7 7H17V9H7ZM7 11H17V13H7ZM7 15H13V17H7Z"></path></svg>',
    transcribe: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M4 4H14C15.1046 4 16 4.89543 16 6V9.17157L20.2929 4.87868C20.9229 4.24871 22 4.69495 22 5.58579V18.4142C22 19.305 20.9229 19.7513 20.2929 19.1213L16 14.8284V18C16 19.1046 15.1046 20 14 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4ZM4 6V18H14V6ZM16 12L20 16V8ZM6 8H12V10H6ZM6 12H12V14H6Z"></path></svg>',
    color: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C17.5228 2 22 6.02944 22 11C22 15.9706 17.9706 20 13 20H11.5C10.6716 20 10 20.6716 10 21.5C10 22.3284 9.32843 23 8.5 23H8C4.68629 23 2 20.3137 2 17V12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12V17C4 19.2091 5.79086 21 8 21H8.5C8.5 19.567 9.567 18 11.5 18H13C16.866 18 20 14.866 20 11C20 7.13401 16.4183 4 12 4ZM7.5 11C6.67157 11 6 10.3284 6 9.5C6 8.67157 6.67157 8 7.5 8C8.32843 8 9 8.67157 9 9.5C9 10.3284 8.32843 11 7.5 11ZM12 9C11.1716 9 10.5 8.32843 10.5 7.5C10.5 6.67157 11.1716 6 12 6C12.8284 6 13.5 6.67157 13.5 7.5C13.5 8.32843 12.8284 9 12 9ZM16.5 11C15.6716 11 15 10.3284 15 9.5C15 8.67157 15.6716 8 16.5 8C17.3284 8 18 8.67157 18 9.5C18 10.3284 17.3284 11 16.5 11Z"></path></svg>',
    social: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M14 4.99997H4V18.3848L5.7627 17H20V11H22V18C22 18.5523 21.5523 19 21 19H6.4541L2 22.5V3.99997C2.00002 3.4477 2.44773 2.99996 3 2.99996H14ZM19.5293 1.3193C19.7058 0.893513 20.2942 0.8935 20.4707 1.3193L20.7236 1.93063C21.1555 2.97343 21.9615 3.80614 22.9746 4.2568L23.6914 4.57614C24.1022 4.75882 24.1022 5.35635 23.6914 5.53903L22.9326 5.87692C21.945 6.3162 21.1534 7.11943 20.7139 8.1279L20.4668 8.69333C20.2863 9.10747 19.7136 9.10747 19.5332 8.69333L19.2861 8.1279C18.8466 7.11942 18.0551 6.3162 17.0674 5.87692L16.3076 5.53903C15.8974 5.35618 15.8974 4.75895 16.3076 4.57614L17.0254 4.2568C18.0384 3.80614 18.8445 2.97343 19.2764 1.93063Z"></path></svg>',
    tiktok: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16 8.24537V15.5C16 19.0899 13.0899 22 9.5 22C5.91015 22 3 19.0899 3 15.5C3 11.9101 5.91015 9 9.5 9C10.0163 9 10.5185 9.06019 11 9.17393V12.3368C10.5454 12.1208 10.0368 12 9.5 12C7.567 12 6 13.567 6 15.5C6 17.433 7.567 19 9.5 19C11.433 19 13 17.433 13 15.5V2H16C16 4.76142 18.2386 7 21 7V10C19.1081 10 17.3696 9.34328 16 8.24537Z"></path></svg>',
    telegram: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.0943 7.14643C17.6874 6.93123 17.9818 6.85378 18.1449 6.82608C18.1461 6.87823 18.1449 6.92051 18.1422 6.94825C17.9096 9.39217 16.8906 15.4048 16.3672 18.2026C16.2447 18.8578 16.1507 19.1697 15.5179 18.798C15.1014 18.5532 14.7245 18.2452 14.3207 17.9805C12.9961 17.1121 11.1 15.8189 11.2557 15.8967C9.95162 15.0373 10.4975 14.5111 11.2255 13.8093C11.3434 13.6957 11.466 13.5775 11.5863 13.4525C11.64 13.3967 11.9027 13.1524 12.2731 12.8081C13.4612 11.7035 15.7571 9.56903 15.8151 9.32202C15.8246 9.2815 15.8334 9.13045 15.7436 9.05068C15.6539 8.97092 15.5215 8.9982 15.4259 9.01989C15.2904 9.05064 13.1326 10.4769 8.95243 13.2986C8.33994 13.7192 7.78517 13.9242 7.28811 13.9134L7.29256 13.9156C6.63781 13.6847 5.9849 13.4859 5.32855 13.286C4.89736 13.1546 4.46469 13.0228 4.02904 12.8812C3.92249 12.8466 3.81853 12.8137 3.72083 12.783C8.24781 10.8109 11.263 9.51243 12.7739 8.884C14.9684 7.97124 16.2701 7.44551 17.0943 7.14643Z"></path></svg>',
    discord: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8.52062 13.8458C7.48059 13.8458 6.63159 12.9014 6.63159 11.7446C6.63159 10.5879 7.45936 9.64331 8.52062 9.64331C9.57123 9.64331 10.4308 10.5879 10.4096 11.7446C10.4096 12.9014 9.57123 13.8458 8.52062 13.8458ZM15.4941 13.8458C14.454 13.8458 13.604 12.9014 13.604 11.7446C13.604 10.5879 14.4328 9.64331 15.4941 9.64331C16.5447 9.64331 17.4043 10.5879 17.3831 11.7446C17.3831 12.9014 16.5553 13.8458 15.4941 13.8458ZM10.1253 4.32296L9.81655 3.76001L9.18323 3.86556C7.71915 4.10958 6.32658 4.54677 5.02544 5.14604L4.79651 5.25148L4.65507 5.46009C2.0418 9.31441 1.3258 13.1087 1.68032 16.8362L1.71897 17.2425L2.04912 17.4824C3.78851 18.7465 5.47417 19.5189 7.12727 20.0257L7.91657 20.2676L9.03013 17.5506C10.9397 18.0226 13.0592 18.0228 14.969 17.5511L16.0757 20.2683L16.8668 20.0256C18.5173 19.5193 20.2137 18.7472 21.9466 17.4811L22.2726 17.243L22.3131 16.8414C22.7491 12.5213 21.616 8.75773 19.3547 5.45652L19.2128 5.24944L18.9846 5.14504C17.6767 4.54685 16.2852 4.10981 14.8309 3.86573L14.2132 3.76207L13.8987 4.30369C13.8112 4.45445 13.7215 4.62464 13.6364 4.79687C12.5441 4.6847 11.456 4.68446 10.3726 4.79652C10.2882 4.62736 10.2025 4.4638 10.1253 4.32296Z"></path></svg>',
    more: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M14 18V16H17.5C19.433 16 21 14.433 21 12.5C21 10.567 19.433 9 17.5 9C16.5205 9 15.6351 9.40232 14.9998 10.0507C14.9999 10.0338 15 10.0169 15 10C15 6.68629 12.3137 4 9 4C5.68629 4 3 6.68629 3 10V10.0069H1V10C1 5.58172 4.58172 2 9 2C12.3949 2 15.2959 4.11466 16.4576 7.09864C16.7951 7.0339 17.1436 7 17.5 7C20.5376 7 23 9.46243 23 12.5C23 15.5376 20.5376 18 17.5 18H14ZM6 20H16V22H6ZM6 12H14V14H6ZM2 16H12V18H2Z"></path></svg>',
    about: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 7H13V9H11ZM11 11H13V17H11Z"></path></svg>'
};

const navSections = [
    {
        label: 'Tools',
        icon: navIcons.tools,
        items: [
            { label: 'Downloader', href: '/tools/downloader', icon: navIcons.downloader },
            { label: 'QR Code', href: '/tools/qr-code', icon: navIcons.qr },
            { label: 'Image PDF', href: '/tools/image-to-pdf', icon: navIcons.pdf },
            { label: 'Text Translator', href: '/tools/text-translator', icon: navIcons.translate },
            { label: 'Text to Speech', href: '/tools/text-to-speech-khmer', icon: navIcons.speech },
            { label: 'Text Counter', href: '/tools/text-counter', icon: navIcons.count },
            { label: 'Transcribe', href: '/tools/video-audio-transcribe', icon: navIcons.transcribe },
            { label: 'Color Converter', href: '/tools/color-converter', icon: navIcons.color },
            { label: 'Telegram Bot', href: 'https://t.me/amertak_downloaderbot', icon: navIcons.telegram, external: true }
        ]
    },
    {
        label: 'Social Media',
        icon: navIcons.social,
        items: [
            { label: 'TikTok', href: 'https://tiktok.com/@amertak.tools', icon: navIcons.tiktok, external: true },
            { label: 'Telegram', href: 'https://t.me/Amertak_Network', icon: navIcons.telegram, external: true },
            { label: 'Discord', href: '/', icon: navIcons.discord }
        ]
    },
    {
        label: 'More',
        icon: navIcons.more,
        items: [
            { label: 'About Us', href: '/about', icon: navIcons.about }
        ]
    }
];

function isActiveHref(href) {
    if (!href || href.startsWith('http')) return false;
    const currentPath = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') || '/';
    const normalizedHref = href.replace(/\/$/, '') || '/';
    return currentPath === normalizedHref;
}

function createNavLink(item) {
    const link = document.createElement('a');
    link.href = item.href;
    link.className = `nav-link${isActiveHref(item.href) ? ' active' : ''}`;
    link.innerHTML = `${item.icon}<span>${item.label}</span>`;
    if (item.external) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    }
    return link;
}

function createNavLabel(section) {
    const label = document.createElement('div');
    label.className = 'nav-label';
    label.innerHTML = `${section.icon}<span>${section.label}</span>`;
    return label;
}

function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const nav = document.createElement('nav');
    nav.className = 'mobile-nav';
    nav.appendChild(createNavLink({ label: 'Home', href: '/', icon: navIcons.home }));
    nav.appendChild(createNavLink({ label: 'Login', href: '/login', icon: navIcons.login }));

    navSections.forEach((section) => {
        nav.appendChild(createNavLabel(section));
        section.items.forEach((item) => nav.appendChild(createNavLink(item)));
    });

    sidebar.replaceChildren(nav);
}

function renderDesktopDropdowns() {
    const navItems = document.querySelectorAll('.desktop-navbar > .nav-item');
    if (!navItems.length) return;

    navItems.forEach((navItem) => {
        const ownText = [...navItem.childNodes]
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent.trim())
            .join(' ')
            .toLowerCase();
        const section = navSections.find((entry) => ownText.includes(entry.label.toLowerCase()));
        const drop = navItem.querySelector('.drop');
        if (!section || !drop) return;

        drop.replaceChildren(...section.items.map((item) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `${item.icon}<span>${item.label}</span>`;
            listItem.addEventListener('click', (event) => {
                event.stopPropagation();
                if (item.external) {
                    window.open(item.href, '_blank', 'noopener');
                    return;
                }
                window.location.href = item.href;
            });
            return listItem;
        }));
    });
}

// THEME TOGGLE: toggles `MODE` class on <body>, swaps icon, persists choice
function initThemeToggle() {
    const btn = document.getElementById('toggleMode');
    const icon = document.getElementById('mode-btn');
    const body = document.body;
    if (!btn || !icon) return;

    const setTheme = (isLight) => {
        if (isLight) {
            body.classList.add('MODE');
            icon.src = '/svg/dark-mode.svg';
            icon.alt = 'Switch to dark mode';
            btn.setAttribute('aria-pressed', 'true');
        } else {
            body.classList.remove('MODE');
            icon.src = '/svg/light-mode.svg';
            icon.alt = 'Switch to light mode';
            btn.setAttribute('aria-pressed', 'false');
        }
    };

    // initialize from localStorage (default: dark mode off)
    const stored = localStorage.getItem('amertak-theme');
    setTheme(stored === 'light');

    const toggleTheme = () => {
        const isLight = !body.classList.contains('MODE');
        setTheme(isLight);
        localStorage.setItem('amertak-theme', isLight ? 'light' : 'dark');
    };

    btn.removeAttribute('onclick');
    btn.addEventListener('click', toggleTheme);
    window.toggleMode = toggleTheme;
}

// auto-init on load
document.addEventListener('DOMContentLoaded', renderSidebar);
document.addEventListener('DOMContentLoaded', renderDesktopDropdowns);
document.addEventListener('DOMContentLoaded', initThemeToggle);
