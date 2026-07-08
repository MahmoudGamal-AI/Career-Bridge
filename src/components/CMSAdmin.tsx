import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, Database, LayoutTemplate, Star, MessageCircle, FileText, CheckCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { subscribeToCMS, addCMSItem, updateCMSItem, deleteCMSItem, seedCMS } from "../lib/db";

export default function CMSAdmin() {
  const [activeTab, setActiveTab] = useState<"stats" | "services_individuals" | "services_companies" | "testimonials" | "faqs" | "steps">("stats");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToCMS(activeTab, (items) => {
      setData(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [activeTab]);

  const handleSeed = async () => {
    if (!window.confirm("This will add default CMS content. Are you sure?")) return;
    try {
      await seedCMS();
      toast.success("Default content seeded successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to seed content.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await deleteCMSItem(activeTab, id);
      toast.success("Item deleted");
    } catch (e) {
      toast.error("Error deleting item");
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await updateCMSItem(activeTab, isEditing, formData);
        toast.success("Updated successfully");
      } else {
        await addCMSItem(activeTab, formData);
        toast.success("Added successfully");
      }
      setIsEditing(null);
      setFormData({});
    } catch (e) {
      toast.error("Error saving item");
    }
  };

  const renderFormInputs = () => {
    if (activeTab === "stats") {
      return (
        <div className="grid grid-cols-2 gap-4">
          <input className="input" placeholder="Label (e.g. Happy Clients)" value={formData.label || ""} onChange={e => setFormData({ ...formData, label: e.target.value })} />
          <input className="input" type="number" placeholder="Value (e.g. 500)" value={formData.value || ""} onChange={e => setFormData({ ...formData, value: Number(e.target.value) })} />
          <input className="input" placeholder="Suffix (e.g. + or %)" value={formData.suffix || ""} onChange={e => setFormData({ ...formData, suffix: e.target.value })} />
          <input className="input" placeholder="Icon Name (e.g. Users, Star)" value={formData.iconName || ""} onChange={e => setFormData({ ...formData, iconName: e.target.value })} />
          <input className="input" type="number" placeholder="Order (e.g. 1)" value={formData.order || ""} onChange={e => setFormData({ ...formData, order: Number(e.target.value) })} />
        </div>
      );
    }
    if (activeTab === "services_individuals" || activeTab === "services_companies") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input className="input" placeholder="Title" value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            <input className="input" placeholder="Icon Name (e.g. FileText)" value={formData.iconName || ""} onChange={e => setFormData({ ...formData, iconName: e.target.value })} />
          </div>
          <textarea className="input h-24" placeholder="Description" value={formData.desc || ""} onChange={e => setFormData({ ...formData, desc: e.target.value })} />
          <input className="input w-1/2" type="number" placeholder="Order (e.g. 1)" value={formData.order || ""} onChange={e => setFormData({ ...formData, order: Number(e.target.value) })} />
        </div>
      );
    }
    if (activeTab === "testimonials") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <input className="input" placeholder="Name" value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <input className="input" placeholder="Role / Company" value={formData.role || ""} onChange={e => setFormData({ ...formData, role: e.target.value })} />
            <input className="input" type="number" placeholder="Rating (1-5)" value={formData.rating || ""} onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })} />
          </div>
          <textarea className="input h-24" placeholder="Testimonial text" value={formData.text || ""} onChange={e => setFormData({ ...formData, text: e.target.value })} />
          <input className="input w-1/3" type="number" placeholder="Order (e.g. 1)" value={formData.order || ""} onChange={e => setFormData({ ...formData, order: Number(e.target.value) })} />
        </div>
      );
    }
    if (activeTab === "faqs") {
      return (
        <div className="space-y-4">
          <input className="input w-full" placeholder="Question" value={formData.q || ""} onChange={e => setFormData({ ...formData, q: e.target.value })} />
          <textarea className="input h-24 w-full" placeholder="Answer" value={formData.a || ""} onChange={e => setFormData({ ...formData, a: e.target.value })} />
          <input className="input w-1/3" type="number" placeholder="Order (e.g. 1)" value={formData.order || ""} onChange={e => setFormData({ ...formData, order: Number(e.target.value) })} />
        </div>
      );
    }
    if (activeTab === "steps") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input className="input" placeholder="Number (e.g. 01)" value={formData.num || ""} onChange={e => setFormData({ ...formData, num: e.target.value })} />
            <input className="input" placeholder="Title" value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <textarea className="input h-24 w-full" placeholder="Description" value={formData.desc || ""} onChange={e => setFormData({ ...formData, desc: e.target.value })} />
          <input className="input w-1/3" type="number" placeholder="Order (e.g. 1)" value={formData.order || ""} onChange={e => setFormData({ ...formData, order: Number(e.target.value) })} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Content Management (CMS)</h2>
          <p className="text-sm text-gray-500 mt-1">Manage website dynamic content like FAQs, Testimonials, and Services.</p>
        </div>
        <button onClick={handleSeed} className="flex items-center gap-2 bg-[#F59E0B] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#D97706] transition-colors">
          <Database className="w-4 h-4" /> Seed Default Content
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4">
        {[
          { id: "stats", label: "Stats", icon: FileText },
          { id: "services_individuals", label: "Services (Individuals)", icon: LayoutTemplate },
          { id: "services_companies", label: "Services (Companies)", icon: LayoutTemplate },
          { id: "testimonials", label: "Testimonials", icon: Star },
          { id: "faqs", label: "FAQs", icon: MessageCircle },
          { id: "steps", label: "Work Steps", icon: CheckCircle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setIsEditing(null); setFormData({}); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === tab.id ? "bg-[#0F4C81] text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 border border-gray-100 rounded-xl p-5 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 mb-4">{isEditing ? "Edit Item" : "Add New Item"}</h3>
          {renderFormInputs()}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#0F4C81] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0A3860] flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save
            </button>
            {isEditing && (
              <button
                onClick={() => { setIsEditing(null); setFormData({}); }}
                className="px-4 bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
          <style>{`
            .input {
              width: 100%;
              padding: 0.5rem 0.75rem;
              border: 1px solid #e5e7eb;
              border-radius: 0.5rem;
              font-size: 0.875rem;
              outline: none;
            }
            .input:focus { border-color: #0F4C81; }
          `}</style>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500 justify-center py-10">
              <RefreshCcw className="w-5 h-5 animate-spin" /> Loading content...
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              No items found. Add a new item or click "Seed Default Content".
            </div>
          ) : (
            <div className="space-y-3">
              {data.map(item => (
                <div key={item.id} className="flex items-start justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-semibold text-gray-900 text-sm">
                      {item.title || item.name || item.q || item.label || item.num} 
                      <span className="text-xs font-normal text-gray-400 ml-2">Order: {item.order || 0}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {item.desc || item.text || item.a || item.role || item.value}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setIsEditing(item.id); setFormData(item); }}
                      className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
