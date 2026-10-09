import Link from 'next/link';

export default function RoleplaysAdminPage() {
 return (
 <div className="min-h-screen bg-[#0f1214] text-white p-8">
 <div className="max-w-6xl mx-auto">
 <h1 className="text-3xl font-bold mb-8 font-serif">AI Scenarios Management</h1>
 
 <div className="flex items-center gap-6 border-b border-gray-800 mb-8">
 <Link href="/dss/admin" className="text-gray-400 hover:text-white transition-colors py-5">Curriculum</Link>
 <Link href="/dss/admin/students" className="text-gray-400 hover:text-white transition-colors py-5">Students</Link>
 <Link href="/dss/admin/roleplays" className="text-[#45bfae] border-b-2 border-[#45bfae] py-5">AI Scenarios</Link>
 </div>

 <div className="bg-[#1a2624] border border-[#248277]/30 p-8 rounded-xl text-center">
 <h2 className="text-xl font-bold mb-4">No AI Scenarios configured</h2>
 <p className="text-gray-400 mb-6">Create your first AI buyer persona and rubric to test students.</p>
 <button className="px-6 py-3 bg-[#45bfae] hover:bg-[#5cd4c3] text-[#0f1214] font-bold rounded-lg transition-colors">
 Create Scenario
 </button>
 </div>
 </div>
 </div>
 );
}
