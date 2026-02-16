import HeaderComponent from "../../components/Header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <HeaderComponent />
      <main>{children}</main>
    </div>
  );
}
