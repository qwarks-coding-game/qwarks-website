import Link from 'next/link';


export default function NavigationElement({to, children}) {
    return (
        <Link href={to}>
            <div style={{margin: "0 10px"}}>
                <h2>{children}</h2>
            </div>
        </Link>
    );
}