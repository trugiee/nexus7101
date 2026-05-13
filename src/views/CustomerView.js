import { state, navigate } from '../state.js';
import { bookings, payments } from '../api.js';

// Removed local booking variables - now using state.js

export function renderCustomer() {
  if (!state.user) return ''; 
  
  const today = new Date().toISOString().split('T')[0];
  const activeSubView = state.customerSubView || 'home';
  
  // Set default view to 'home' if not set
  if (!state.customerSubView) state.customerSubView = 'home';

  return `
    <div class="min-h-screen py-6 px-4 sm:py-12 sm:px-6 md:py-20 md:px-8 flex flex-col items-center">
      
      <!-- High-Visibility Sanctuary Container -->
      <div class="w-full max-w-6xl bg-white rounded-[2rem] sm:rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.15)] p-6 sm:p-10 md:p-12 lg:p-16 space-y-10 border border-slate-100 animate-scale-up">
        
        <!-- Header -->
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b-2 border-slate-100 gap-6">
           <div>
              <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter italic">Hi, ${state.user ? state.user.name.split(' ')[0] : 'Guest'}!</h1>
              <p class="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2">
                 Welcome to your CottageEase Sanctuary
              </p>
           </div>
           <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div class="flex bg-slate-100 p-1.5 rounded-2xl">
                <button id="viewHome" class="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubView === 'home' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}">
                  Explore
                </button>
                <button id="viewHistory" class="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubView === 'history' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}">
                  History
                </button>
              </div>
              <button id="logoutBtn" class="ml-auto md:ml-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-rose-600 transition-colors">Logout</button>
           </div>
        </header>

        ${activeSubView === 'home' ? renderHomeView(today) : activeSubView === 'history' ? renderHistoryView() : ''}

        <div class="pt-10 text-center">
           <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">CottageEase Managed Sanctuary</p>
        </div>
      </div>

      <!-- Multi-Step Booking Modal -->
      <div id="bookingModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] ${state.bookingStep === 'idle' ? 'hidden' : ''} flex items-center justify-center p-6">
        <div class="bg-white max-w-md w-full p-8 md:p-12 rounded-[3.5rem] shadow-3xl animate-scale-up border-2 border-white overflow-hidden relative">
           ${renderModalContent()}
        </div>
      </div>
    </div>
  `;
}

function renderHomeView(today) {
  const displayDate = state.selectedDate || today;
  const bookedOnDate = state.bookings.filter(b => b.date === displayDate && b.status === 'Confirmed').map(b => Number(b.cottageId));
  
  // Logic for calendar
  const now = new Date();
  const currentYear = state.viewYear || now.getFullYear();
  const currentMonth = state.viewMonth !== undefined ? state.viewMonth : now.getMonth();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  return `
    <div class="grid lg:grid-cols-12 gap-12 animate-fade-in">
      <!-- Calendar Section -->
      <div class="lg:col-span-5 space-y-8">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-black text-slate-900 tracking-tighter italic">Select Date.</h2>
            <p class="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">${monthNames[currentMonth]} ${currentYear}</p>
          </div>
          <div class="flex gap-2">
            <button id="prevMonth" class="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-500 hover:text-slate-900">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button id="nextMonth" class="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-500 hover:text-slate-900">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>

        <div class="bg-slate-50/50 rounded-[2.5rem] p-6 border border-slate-100">
          <div class="grid grid-cols-7 gap-1 mb-4">
            ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<div class="text-center text-[10px] font-black text-slate-400 py-2">${d}</div>`).join('')}
            ${generateCalendarDays(currentYear, currentMonth, displayDate)}
          </div>
          <div class="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-slate-900"></div>
              <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Selected</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-rose-500"></div>
              <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Fully Booked</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Cottages Section -->
      <div class="lg:col-span-7 space-y-8">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tighter italic">Available Cottages.</h2>
          <p class="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">${displayDate === today ? 'TODAY, ' : ''}${new Date(displayDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-6">
          ${state.cottages.filter(c => c.active).map(c => {
            const isBooked = bookedOnDate.includes(c.id);
            return `
              <div 
                class="cottage-card group transition-all relative ${isBooked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-2'}"
                ${isBooked ? '' : `data-id="${c.id}" data-price="${c.price}" data-date="${displayDate}"`}
              >
                <div class="aspect-[4/5] bg-slate-50 rounded-[2rem] flex flex-col items-center justify-center border-2 border-slate-100 transition-all group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:shadow-2xl group-hover:shadow-slate-900/20 overflow-hidden">
                   <div class="absolute top-4 left-4">
                     <span class="text-[10px] font-black ${isBooked ? 'text-slate-600' : 'text-slate-500 group-hover:text-slate-400'} uppercase tracking-widest transition-colors">#${c.id}</span>
                   </div>
                   <div class="space-y-1 text-center px-4">
                     <p class="text-sm font-black text-slate-900 group-hover:text-white transition-colors">${c.category}</p>
                     <p class="text-[10px] font-black text-slate-600 group-hover:text-slate-400 transition-colors">₱${c.price.toLocaleString()}</p>
                   </div>
                   ${isBooked ? `
                     <div class="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                       <span class="text-[9px] font-black uppercase tracking-[0.2em] text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200">Occupied</span>
                     </div>
                   ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderHistoryView() {
  return `
    <div class="space-y-10 animate-fade-in max-w-4xl mx-auto">
      <div class="text-center">
        <h2 class="text-3xl font-black text-slate-900 tracking-tighter italic">My Bookings.</h2>
        <p class="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mt-2">All your sanctuary reservations</p>
      </div>

      <div class="grid gap-6">
        ${state.bookings.filter(b => b.userId === (state.user?.id)).length === 0 ? `
          <div class="bg-slate-50 p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
            <p class="text-slate-600 font-black uppercase tracking-widest text-xs">No bookings found yet</p>
          </div>
        ` : state.bookings.filter(b => b.userId === (state.user?.id)).sort((a, b) => b.date.localeCompare(a.date)).map(b => `
          <div class="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-wrap items-center justify-between gap-6 hover:border-slate-900 hover:shadow-xl hover:shadow-slate-900/5 transition-all group">
            <div class="flex items-center gap-8">
              <div class="w-16 h-16 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <span class="text-[9px] font-black uppercase opacity-70">ID</span>
                <span class="text-xl font-black">#${b.cottageId}</span>
              </div>
              <div>
                <p class="text-xl font-black text-slate-900 tracking-tighter">${new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                <p class="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Ref: ${b.id.substring(0, 8)} • ₱${b.total.toLocaleString()}</p>
              </div>
            </div>
            <div class="flex items-center gap-6">
              <div class="text-right">
                <span class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : b.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                  ${b.status}
                </span>
              </div>
              <button class="view-receipt-btn bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-black transition-all shadow-lg active:scale-95" data-id="${b.id}">
                Pass
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function generateCalendarDays(year, month, selectedDate) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  
  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push('<div class="aspect-square"></div>');
  }
  
  const today = new Date().toISOString().split('T')[0];
  const numCottages = state.cottages.filter(c => c.active).length;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isSelected = dateStr === selectedDate;
    const isPast = dateStr < today;
    
    // Check if fully booked
    const bookedCount = state.bookings.filter(b => b.date === dateStr && b.status === 'Confirmed').length;
    const isFullyBooked = bookedCount >= numCottages && numCottages > 0;

    days.push(`
      <div 
        class="calendar-day aspect-square flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all relative group
        ${isSelected ? 'bg-slate-900 text-white shadow-lg z-10' : 'hover:bg-slate-200'} 
        ${isPast ? 'opacity-30 pointer-events-none' : 'text-slate-800'}
        ${isFullyBooked && !isSelected ? 'text-rose-600 font-black' : ''}"
        data-date="${dateStr}"
      >
        <span class="text-sm font-bold">${d}</span>
        ${isFullyBooked ? '<div class="absolute bottom-1.5 w-1 h-1 rounded-full bg-rose-600"></div>' : ''}
        ${isSelected ? '' : bookedCount > 0 && bookedCount < numCottages ? '<div class="absolute bottom-1.5 w-1 h-1 rounded-full bg-emerald-500"></div>' : ''}
      </div>
    `);
  }
  
  return days.join('');
}


function renderModalContent() {
  switch (state.bookingStep) {
    case 'addons':
      return `
        <div class="space-y-8">
          <div class="text-center">
            <h3 class="text-3xl font-black text-slate-900 tracking-tighter italic">Enhance Your Stay.</h3>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Cottage #${state.currentBooking.cottageId} • ${state.currentBooking.date}</p>
          </div>
          
          <div class="space-y-4">
            ${state.addons.map(addon => {
        // Ensure comparison works regardless of type (string vs number)
        const isSelected = state.currentBooking.selectedAddons.some(id => String(id) === String(addon.id));
        return `
                <div class="addon-toggle p-6 rounded-3xl border-2 transition-all cursor-pointer flex justify-between items-center ${isSelected ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300'}" data-id="${addon.id}">
                  <div>
                    <p class="font-black text-lg">${addon.name}</p>
                    <p class="text-[10px] uppercase font-bold opacity-60">Add ₱${addon.price.toLocaleString()}</p>
                  </div>
                  <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-white bg-white' : 'border-slate-300'}">
                    ${isSelected ? '<svg class="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' : ''}
                  </div>
                </div>
              `;
      }).join('')}
          </div>

          <div class="pt-4 space-y-4">
            <button id="goToPayment" class="w-full bg-slate-900 text-white font-black py-6 rounded-2xl hover:bg-black transition-all active:scale-95 shadow-2xl shadow-slate-900/20">Review & Pay</button>
            <button id="closeModal" class="w-full text-xs font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors text-center">Cancel</button>
          </div>
        </div>
      `;

    case 'payment':
      const addonsTotal = state.currentBooking.selectedAddons.reduce((sum, id) => {
        const addon = state.addons.find(a => a.id === id);
        return sum + (addon ? addon.price : 0);
      }, 0);
      state.currentBooking.total = state.currentBooking.price + addonsTotal;

      return `
        <div class="space-y-8 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
          <div class="text-center">
            <h3 class="text-3xl font-black text-slate-900 tracking-tighter italic">Payment Details.</h3>
          </div>

          <div class="bg-slate-50 rounded-[2.5rem] p-8 space-y-4 border border-slate-100">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-black text-slate-400 uppercase">Cottage #${state.currentBooking.cottageId}</span>
              <span class="font-black text-slate-900">₱${state.currentBooking.price.toLocaleString()}</span>
            </div>
            ${state.currentBooking.selectedAddons.map(id => {
        const addon = state.addons.find(a => a.id === id);
        return `
                <div class="flex justify-between items-center text-slate-500">
                  <span class="text-[10px] font-black uppercase">+ ${addon.name}</span>
                  <span class="font-bold text-sm">₱${addon.price.toLocaleString()}</span>
                </div>
              `;
      }).join('')}
            <div class="h-px bg-slate-200 w-full my-2"></div>
            <div class="flex justify-between items-center pt-2">
              <span class="text-xs font-black text-slate-900 uppercase tracking-widest">Total Amount</span>
              <span class="text-3xl font-black text-slate-900 tracking-tighter">₱${state.currentBooking.total.toLocaleString()}</span>
            </div>
          </div>

          <div class="space-y-6">
            <button id="payGCash" class="w-full bg-[#0055ff] text-white font-black py-6 rounded-2xl hover:bg-[#0044cc] transition-all active:scale-95 shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-3">
              Proceed to GCash Checkout
            </button>
            <button id="backToAddons" class="w-full text-xs font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors text-center">Back to Add-ons</button>
          </div>
        </div>
      `;

    case 'receipt':
      const qrData = state.currentBooking.transactionId;
      const booking = state.bookings.find(b => b.id === state.currentBooking.transactionId);

      return `
        <div class="space-y-8 max-h-[80vh] overflow-y-auto pr-2">
          <div class="text-center">
             <div class="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
             </div>
             <h3 class="text-3xl font-black text-slate-900 tracking-tighter italic">Digital Pass Ready</h3>
             <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Show this to the guard upon arrival</p>
          </div>

          <div id="receiptToDownload" class="bg-white border-2 border-slate-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 space-y-6 md:space-y-8 relative overflow-hidden text-center shadow-2xl">
             <!-- Ticket Notches -->
             <div class="absolute -left-4 md:-left-5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-full border-r-2 border-slate-900"></div>
             <div class="absolute -right-4 md:-right-5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-full border-l-2 border-slate-900"></div>

             <div class="space-y-2">
                <p class="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">OFFICIAL QR PASS</p>
                <div class="bg-white p-2 md:p-4 rounded-2xl md:rounded-3xl inline-block border-2 border-slate-100">
                   <canvas id="qrCanvas"></canvas>
                </div>
                <p class="text-[10px] md:text-xs font-black text-slate-900 mt-4 tracking-widest break-all">${qrData}</p>
             </div>

             <div class="grid grid-cols-2 gap-4 pt-4 border-t-2 border-dashed border-slate-100">
                <div class="text-left">
                   <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter">Cottage No.</p>
                   <p class="text-lg md:text-xl font-black text-slate-900">#${state.currentBooking.cottageId}</p>
                </div>
                <div class="text-right">
                   <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter">Reservation Date</p>
                   <p class="text-lg md:text-xl font-black text-slate-900">${state.currentBooking.date}</p>
                </div>
             </div>

             <div class="pt-2 md:pt-4">
                <div class="bg-slate-900 text-white rounded-xl md:rounded-2xl py-2 md:py-3 px-4 md:px-6 inline-block">
                   <p class="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Status: ${state.currentBooking.status || 'Verified'}</p>
                </div>
             </div>
          </div>

          <div class="space-y-4">
            <button id="downloadPass" class="w-full bg-emerald-500 text-white font-black py-6 rounded-2xl hover:bg-emerald-600 transition-all active:scale-95 shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download Pass (PNG)
            </button>
            <button id="finishBooking" class="w-full bg-slate-900 text-white font-black py-6 rounded-2xl hover:bg-black transition-all active:scale-95 shadow-2xl shadow-slate-900/20">Return to Home</button>
          </div>
        </div>
      `;

    default:
      return '';
  }
}

export function attachCustomerListeners(renderFn) {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.onclick = () => {
    state.user = null;
    state.token = null;
    state.bookings = [];
    state.cottages = [];
    state.users = [];
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('login', renderFn);
  };

  const viewHome = document.getElementById('viewHome');
  if (viewHome) viewHome.onclick = () => {
    state.customerSubView = 'home';
    renderFn();
  };

  const viewHistory = document.getElementById('viewHistory');
  if (viewHistory) viewHistory.onclick = () => {
    state.customerSubView = 'history';
    renderFn();
  };

  // Calendar Listeners
  const prevMonth = document.getElementById('prevMonth');
  if (prevMonth) prevMonth.onclick = () => {
    const now = new Date();
    if (state.viewMonth === undefined) {
      state.viewMonth = now.getMonth();
      state.viewYear = now.getFullYear();
    }
    state.viewMonth--;
    if (state.viewMonth < 0) {
      state.viewMonth = 11;
      state.viewYear--;
    }
    renderFn();
  };

  const nextMonth = document.getElementById('nextMonth');
  if (nextMonth) nextMonth.onclick = () => {
    const now = new Date();
    if (state.viewMonth === undefined) {
      state.viewMonth = now.getMonth();
      state.viewYear = now.getFullYear();
    }
    state.viewMonth++;
    if (state.viewMonth > 11) {
      state.viewMonth = 0;
      state.viewYear++;
    }
    renderFn();
  };

  const calendarDays = document.querySelectorAll('.calendar-day[data-date]');
  calendarDays.forEach(day => {
    day.onclick = () => {
      state.selectedDate = day.dataset.date;
      renderFn();
    };
  });

  // Cottage selection
  const cottageCards = document.querySelectorAll('.cottage-card[data-id]');
  cottageCards.forEach(card => {
    card.onclick = () => {
      state.currentBooking = {
        cottageId: Number(card.dataset.id),
        date: card.dataset.date,
        price: Number(card.dataset.price),
        selectedAddons: [],
        total: 0,
        transactionId: ''
      };
      state.bookingStep = 'addons';
      renderFn();
    };
  });

  // Modal actions
  const closeBtn = document.getElementById('closeModal');
  if (closeBtn) closeBtn.onclick = () => {
    state.bookingStep = 'idle';
    renderFn();
  };

  // Addon toggles
  const addonToggles = document.querySelectorAll('.addon-toggle');
  addonToggles.forEach(toggle => {
    toggle.onclick = () => {
      const id = Number(toggle.dataset.id); 
      if (state.currentBooking.selectedAddons.includes(id)) {
        state.currentBooking.selectedAddons = state.currentBooking.selectedAddons.filter(a => a !== id);
      } else {
        state.currentBooking.selectedAddons.push(id);
      }
      renderFn();
    };
  });

  const goToPayment = document.getElementById('goToPayment');
  if (goToPayment) goToPayment.onclick = () => {
    state.bookingStep = 'payment';
    renderFn();
  };

  const backToAddons = document.getElementById('backToAddons');
  if (backToAddons) backToAddons.onclick = () => {
    state.bookingStep = 'addons';
    renderFn();
  };

  const payGCash = document.getElementById('payGCash');
  if (payGCash) payGCash.onclick = async () => {
    try {
      const bookingRes = await bookings.create({
        cottageId: state.currentBooking.cottageId,
        date: state.currentBooking.date,
        addons: state.currentBooking.selectedAddons,
        total: state.currentBooking.total,
        paymentMethod: 'GCash'
      });

      state.currentBooking.transactionId = bookingRes.data.id;

      const checkoutRes = await payments.createCheckout({
        amount: state.currentBooking.total,
        description: `Cottage #${state.currentBooking.cottageId} Reservation`,
        bookingId: bookingRes.data.id,
        origin: window.location.origin
      });

      if (checkoutRes.data.checkout_url) {
        window.location.href = checkoutRes.data.checkout_url;
      } else {
        alert("Payment gateway error");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      const msg = error.response?.data?.error || "Failed to create booking.";
      alert(msg);
    }
  };

  const viewReceiptBtns = document.querySelectorAll('.view-receipt-btn, #viewLatestReceipt');
  viewReceiptBtns.forEach(btn => {
    btn.onclick = () => {
      let bookingId = btn.dataset.id;
      let targetBooking;
      
      if (bookingId) {
        targetBooking = state.bookings.find(b => b.id === bookingId);
      } else {
        targetBooking = state.bookings.find(b => b.userId === (state.user?.id));
      }

      if (targetBooking) {
        state.currentBooking = {
          cottageId: targetBooking.cottageId,
          date: targetBooking.date,
          price: targetBooking.total, 
          selectedAddons: targetBooking.addons || [],
          total: targetBooking.total,
          transactionId: targetBooking.id,
          status: targetBooking.status
        };
        state.bookingStep = 'receipt';
        renderFn();
      }
    };
  });

  const finishBooking = document.getElementById('finishBooking');
  if (finishBooking) finishBooking.onclick = () => {
    state.bookingStep = 'idle';
    renderFn();
  };

  const downloadBtn = document.getElementById('downloadPass');
  if (downloadBtn) {
    if (state.bookingStep === 'receipt') {
      const qrCanvas = document.getElementById('qrCanvas');
      if (qrCanvas && typeof QRious !== 'undefined') {
        new QRious({
          element: qrCanvas,
          value: state.currentBooking.transactionId,
          size: 160,
          level: 'H'
        });
      }
    }

    downloadBtn.onclick = async () => {
      if (typeof html2canvas === 'undefined') {
        alert("System still loading components... Please wait 3 seconds and try again.");
        return;
      }

      const receipt = document.getElementById('receiptToDownload');
      if (!receipt) return;
      
      const btn = downloadBtn;
      btn.disabled = true;
      btn.innerHTML = "Generating Image...";

      try {
        const originalTransform = receipt.style.transform;
        receipt.style.transform = 'none';

        const canvas = await html2canvas(receipt, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          imageTimeout: 0
        });
        
        const link = document.createElement('a');
        link.download = `Booking_Pass_${state.currentBooking.transactionId}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        btn.innerHTML = "Download Pass (PNG)";
      } catch (err) {
        console.error("Download Error:", err);
        alert("Failed to download. Please take a screenshot for now.");
        btn.innerHTML = "Download Pass (PNG)";
      } finally {
        btn.disabled = false;
        const receipt = document.getElementById('receiptToDownload');
        if (receipt) receipt.style.transform = '';
      }
    };
  }
}

