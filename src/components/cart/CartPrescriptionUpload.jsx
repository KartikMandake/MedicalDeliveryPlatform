export default function CartPrescriptionUpload() {
  return (
    <div className="mt-12 bg-surface-container-low rounded-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline text-xl font-bold">Prescription Documents</h2>
        <button className="text-primary font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined">upload_file</span>
          Upload New
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest p-4 rounded-lg flex items-center gap-4 border border-outline-variant/20">
          <div className="w-16 h-20 bg-surface-container rounded overflow-hidden shadow-sm">
            <img alt="Doctor Note Preview" className="w-full h-full object-cover opacity-60" data-alt="Blurred thumbnail of a medical prescription document" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt24UWx1HnRfLGjducp5IHFY84MZPpikuEDpR3lx4xL_0LPypobTT_0qstxdp4xOJv9wS7yJp0kQePcgdLk6rtOPwCdQGEdoKfVzhz_JwsEXHL0jkCDoY8alOza44Tg1Ii42b9tQbaF_U0Bzko3YBlhzjs5d-CVAVFEQB2StQoqNRS8EuADfRU1G_TVM87kr6EZgEkPNGdc6vyA0maybXkUqfFuUc3qpsCUajprHSIZNXS9co3cCBbc2HDhBqp-KXLfElm4S_KxDQI"/>
          </div>
          <div className="flex-grow overflow-hidden">
            <p className="font-bold text-sm truncate">dr_smith_rx_2405.pdf</p>
            <p className="text-xs text-outline">Uploaded Oct 12, 2024</p>
            <div className="mt-2 flex gap-3">
              <button className="text-xs text-primary font-bold">View</button>
              <button className="text-xs text-error font-bold">Remove</button>
            </div>
          </div>
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <div className="border-2 border-dashed border-outline-variant rounded-lg p-4 flex items-center justify-center text-outline gap-3 hover:bg-white/50 cursor-pointer transition-colors">
          <span className="material-symbols-outlined">add_circle</span>
          <span className="text-sm font-medium">Add another prescription</span>
        </div>
      </div>
    </div>
  );
}
