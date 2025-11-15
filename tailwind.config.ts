import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			// Figma CSS Variable Colors
  			strokecard: 'var(--strokecard)',
  			'variable-collection-colors-a-shade1': 'var(--variable-collection-colors-a-shade1)',
  			'variable-collection-colors-a-shade2': 'var(--variable-collection-colors-a-shade2)',
  			'variable-collection-colors-a-shade3': 'var(--variable-collection-colors-a-shade3)',
  			'variable-collection-colors-a-shade4': 'var(--variable-collection-colors-a-shade4)',
  			'variable-collection-colors-a-shade5': 'var(--variable-collection-colors-a-shade5)',
  			'variable-collection-colors-accent-color': 'var(--variable-collection-colors-accent-color)',
  			'variable-collection-colors-candy-20': 'var(--variable-collection-colors-candy-20)',
  			'variable-collection-colors-p-shade1': 'var(--variable-collection-colors-p-shade1)',
  			'variable-collection-colors-p-shade2': 'var(--variable-collection-colors-p-shade2)',
  			'variable-collection-colors-p-shade3': 'var(--variable-collection-colors-p-shade3)',
  			'variable-collection-colors-p-shade4': 'var(--variable-collection-colors-p-shade4)',
  			'variable-collection-colors-p-shade5': 'var(--variable-collection-colors-p-shade5)',
  			'variable-collection-colors-p-shade6': 'var(--variable-collection-colors-p-shade6)',
  			'variable-collection-colors-primary-color': 'var(--variable-collection-colors-primary-color)',
  			'variable-collection-colors-s-shade1': 'var(--variable-collection-colors-s-shade1)',
  			'variable-collection-colors-s-shade2': 'var(--variable-collection-colors-s-shade2)',
  			'variable-collection-colors-s-shade3': 'var(--variable-collection-colors-s-shade3)',
  			'variable-collection-colors-s-shade4': 'var(--variable-collection-colors-s-shade4)',
  			'variable-collection-colors-s-shade5': 'var(--variable-collection-colors-s-shade5)',
  			'variable-collection-colors-secondary-color': 'var(--variable-collection-colors-secondary-color)',
  			'variable-collection-colors-white': 'var(--variable-collection-colors-white)',
  			'variable-collection-colors-white-card': 'var(--variable-collection-colors-white-card)',
  			'variable-collection-colors-white-card2': 'var(--variable-collection-colors-white-card2)',
  			'variable-collection-inner-box': 'var(--variable-collection-inner-box)',

  			// shadcn/ui compatible aliases
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			'accent-font': 'var(--accent-font-font-family)',
  			'primary-font': 'var(--primary-font-font-family)',
  			'secondary-font': 'var(--secondary-font-font-family)',
  			sans: ['Inter Tight', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  		},
  		boxShadow: {
  			cardshadownew: 'var(--cardshadownew)',
  			cardshadowreview: 'var(--cardshadowreview)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		transitionDuration: {
  			'80': '80ms',
  			'120': '120ms',
  			'140': '140ms',
  			'160': '160ms',
  			'180': '180ms',
  			'220': '220ms',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
