import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function DonationDashboard() {

  // Dark Mode
  const [darkMode, setDarkMode] = useState(false);

  // Load donation from localStorage OR default
  const [donations, setDonations] = useState(() => {
    const saved = localStorage.getItem("donations");
    return saved ? JSON.parse(saved) : [
      { name: "Rahul", amount: 500 },
      { name: "Priya", amount: 1200 },
      { name: "Amit", amount: 750 },
      { name: "Neha", amount: 300 },
      { name: "Rahul", amount: 200 },
      { name: "Saurabh", amount: 1000 },
    ];
  });

  useEffect(() => {
    localStorage.setItem("donations", JSON.stringify(donations));
  }, [donations]);


  // Chart Refs
  const pieRef = useRef(null);
  const barRef = useRef(null);
  const pieChart = useRef(null);
  const barChart = useRef(null);


  // Summary
  const totalAmount = donations.reduce((a,b)=>a+b.amount,0);
  const totalDonors = new Set(donations.map(d=>d.name)).size;

  const totals = {};
  donations.forEach(d => totals[d.name] = (totals[d.name] || 0) + d.amount);


  // Render Charts
  useEffect(()=>{
    if(pieChart.current) pieChart.current.destroy();
    if(barChart.current) barChart.current.destroy();

    pieChart.current = new Chart(pieRef.current,{
      type:"pie",
      data:{
        labels:Object.keys(totals),
        datasets:[{
          data:Object.values(totals),
          backgroundColor:["#2563eb","#10b981","#f59e0b","#ef4444","#8b5cf6"]
        }]
      }
    });

    barChart.current = new Chart(barRef.current,{
      type:"bar",
      data:{
        labels:Object.keys(totals),
        datasets:[{
          label:"Donation Amount",
          data:Object.values(totals),
          backgroundColor:"#3b82f6"
        }]
      },
      options:{responsive:true,scales:{y:{beginAtZero:true}}}
    });

  },[donations]);


  // Add Donation
  const addDonation = (e)=>{
    e.preventDefault();
    const name=e.target.name.value.trim();
    const amount=Number(e.target.amount.value);

    if(!name||!amount) return alert("Enter valid donor & amount");

    setDonations([...donations,{name,amount}]);
    e.target.reset();
  };

  // Edit Donation
  const editDonation = (i)=>{
    const name = prompt("Enter new name:",donations[i].name);
    const amount = prompt("Enter new amount:",donations[i].amount);

    if(name&&amount){
      const updated=[...donations];
      updated[i]={name,amount:Number(amount)};
      setDonations(updated);
    }
  };

  // Delete Donation
  const deleteDonation = (i)=>{
    setDonations(donations.filter((_,index)=>index!==i));
  };


  const [search,setSearch]=useState("");


  return (
    <div className={`${darkMode?"bg-gray-900 text-white":"bg-gray-100 text-black"} min-h-screen py-12 px-6 flex flex-col items-center`}>

      <div className="w-full max-w-5xl flex justify-end mb-4">
        <button onClick={()=>setDarkMode(!darkMode)}
          className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-black transition">
          {darkMode?"Light Mode":"Dark Mode"}
        </button>
      </div>

      <h1 className="text-4xl font-bold text-blue-500 mb-10 text-center">
        Donation Tracking Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl">
        <Card title="Total Donations" value={`₹${totalAmount}`} color="text-green-500"/>
        <Card title="Unique Donors" value={totalDonors} color="text-blue-500"/>
        <Card title="Transactions" value={donations.length} color="text-orange-500"/>
      </div>


      {/* Charts */}
      <Section title="Contribution Pie Chart">
        <canvas ref={pieRef} height="120"></canvas>
      </Section>

      <Section title="Donation Trend - Bar Chart">
        <canvas ref={barRef} height="120"></canvas>
      </Section>


      {/* Add Donation */}
      <Section title="Add New Donation">
        <form onSubmit={addDonation} className="flex gap-4 flex-wrap">
          <input name="name" placeholder="Donor Name"
            className="border p-2 rounded w-full md:w-1/2 text-black"/>

          <input name="amount" type="number" placeholder="Amount ₹"
            className="border p-2 rounded w-full md:w-1/3 text-black"/>

          <button type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Add
          </button>
        </form>
      </Section>


      {/* Donation Table */}
      <Section title="Donation Records">

        <input placeholder="Search donor..." value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="border p-2 rounded mb-4 w-full text-black"/>

        <table className="w-full border">

          <thead>
            <tr className="bg-gray-300">
              <th className="p-3 text-center">Donor</th>
              <th className="p-3 text-center">Amount</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
          {donations
            .filter(d=>d.name.toLowerCase().includes(search.toLowerCase()))
            .map((d,i)=>(
            <tr key={i} className="border-t hover:bg-gray-100 text-black">
              <td className="p-3 text-center">{d.name}</td>
              <td className="p-3 text-center font-semibold">₹{d.amount}</td>
              <td className="p-3">
                <div className="flex justify-center gap-2">

                  <button className="bg-yellow-500 text-white px-3 py-1 rounded"
                    onClick={()=>editDonation(i)}>Edit</button>

                  <button className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={()=>deleteDonation(i)}>Delete</button>

                </div>
              </td>
            </tr>
          ))}
          </tbody>

        </table>
      </Section>

    </div>
  );
}



/* Components */
function Card({title,value,color}) {
  return(
    <div className="bg-white p-6 rounded-xl shadow-md border-l-8 border-blue-600 w-full">
      <p className="text-gray-600 text-sm">{title}</p>
      <h2 className={`text-3xl font-bold mt-1 ${color}`}>{value}</h2>
    </div>
  );
}

function Section({title,children}) {
  return(
    <div className="bg-white p-6 mt-10 rounded-xl shadow-lg max-w-4xl w-full mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-blue-600">{title}</h2>
      {children}
    </div>
  );
}

