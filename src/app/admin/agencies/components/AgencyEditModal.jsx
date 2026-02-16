
'use client';

import { Button, Checkbox, Label, Modal, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useAgencyStore,useAgencyEditModal } from "../../../../store/agencyStore";


const AgencyEditModal=()=> {


  const { isOpen, agencyData, closeModal } = useAgencyEditModal();
  const {updateAgency} = useAgencyStore()
  
  
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    phone: "",
    street: "",
    district: "",
    state: "",
    pincode: ""
  });



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateAgency(agencyData._id, formData);
    closeModal();
  };

  useEffect(()=>{
      if(agencyData){
        setFormData(agencyData)
      }
  },[agencyData])

  if (!isOpen) return null;



  return (
    <>
     
      <Modal show={isOpen} onClose={closeModal} size="md" popup>
        <Modal.Header />
        <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-2">
           
           <div  >
           <label htmlFor="name"  >Agency Name</label>
           <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="Name" />
           </div>

           <div  >
           <label htmlFor="name"  >City</label>
           <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="City" />

           </div>

           <div  >
           <label htmlFor="name"  >Phone</label>
           <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="Phone" />

           </div>

           <div  >
           <label htmlFor="name"  >Street</label>
           <input type="text" name="street" value={formData.street} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="Street" />

           </div>

           <div  >
           <label htmlFor="name"  >District</label>
           <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full border p-2 rounded" placeholder="District" />

           </div>

           <div  >
           <label htmlFor="name"  >State</label>
           <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="State" />

           </div>

           <div  >
           <label htmlFor="name"  >Pincode</label>
           <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="Pincode" />

           </div>
           

         

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Save Changes
            </button>
          </div>
        </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AgencyEditModal