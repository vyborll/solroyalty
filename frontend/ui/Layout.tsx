import Navbar from './Navbar';

interface Props {
	children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
	return (
		<>
			<Navbar />
			<div className="max-w-screen-2xl mx-auto p-4 sm:p-8 space-y-8">{children}</div>
		</>
	);
};

export default Layout;
