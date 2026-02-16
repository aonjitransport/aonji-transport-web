import LoadingComponent from "@/components/ui/LoadingComponent";
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoadingComponent/>
        <p className="text-gray-500">Loading agency...</p>
    </div>
  );
}