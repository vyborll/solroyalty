/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./pages/**/*.{js,ts,jsx,tsx}', './ui/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: {
					100: 'rgba(255, 255, 255, 0.6)',
				},
				green: {
					950: '#2ddb53',
				},
				dark: {
					600: '#414141',
					700: '#2b2b2b',
					800: '#1a1a1a',
					900: '#111111',
				},
			},
		},
	},
	plugins: [],
};
