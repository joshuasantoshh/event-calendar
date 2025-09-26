// Sample destination data
const destinations = [
  { id: 1, name: 'Nice', country: 'France', interest: 'beach', summary: 'Sandy beaches & promenade',
    activities: [
      { id: 'a1', title: 'Beach day', price: 0 },
      { id: 'a2', title: 'Old Town walking tour', price: 1500 },
      { id: 'a3', title: 'Boat trip', price: 3400 }
    ]
  },
  { id: 2, name: 'Interlaken', country: 'Switzerland', interest: 'mountain', summary: 'Gateway to alpine activities',
    activities: [
      { id: 'b1', title: 'Hiking', price: 0 },
      { id: 'b2', title: 'Paragliding', price: 9600 },
      { id: 'b3', title: 'Mountain train', price: 2800 }
    ]
  },
  { id: 3, name: 'Barcelona', country: 'Spain', interest: 'city', summary: 'Gaudí, beaches & food',
    activities: [
      { id: 'c1', title: 'Sagrada Familia tour', price: 2400 },
      { id: 'c2', title: 'Tapas tasting', price: 3200 },
      { id: 'c3', title: 'Beach volley', price: 0 }
    ]
  },
  { id: 4, name: 'Queenstown', country: 'New Zealand', interest: 'adventure', summary: 'Adventure capital',
    activities: [
      { id: 'd1', title: 'Bungee jump', price: 14400 },
      { id: 'd2', title: 'Jet boating', price: 7200 },
      { id: 'd3', title: 'Hike', price: 0 }
    ]
  }
];

let state = { selectedDestination: null, selectedActivities: [], itinerary: [] };

function renderDestinations() {
  const interest = $('#interestFilter').val();
  const q = $('#searchBox').val().toLowerCase();
  $('#destinationsRow').empty();

  const filtered = destinations.filter(d => {
    const matchesInterest = (interest === 'all' || d.interest === interest);
    const matchesQuery = d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q);
    return matchesInterest && matchesQuery;
  });

  if (!filtered.length) {
    $('#destinationsRow').append('<div class="col"><div class="card"><div class="card-body small-note">No destinations match your search.</div></div></div>');
    return;
  }

  filtered.forEach(d => {
    const card = $(`
      <div class="col">
        <div class="card destination-card" data-id="${d.id}" role="button">
          <div class="card-body">
            <h5 class="card-title">${d.name} <small class="text-muted">${d.country}</small></h5>
            <p class="card-text small-note">${d.summary}</p>
            <div class="d-flex justify-content-between align-items-center">
              <div class="badge bg-light text-dark text-capitalize">${d.interest}</div>
              <button class="btn btn-sm btn-outline-primary select-destination">Select</button>
            </div>
          </div>
        </div>
      </div>
    `);
    $('#destinationsRow').append(card);
  });

  if (state.selectedDestination) {
    $(`.destination-card[data-id='${state.selectedDestination}']`).addClass('selected');
  }
}

function renderActivities() {
  $('#activitiesList').empty();
  if (!state.selectedDestination) {
    $('#activitiesList').append('<div class="small-note">Choose a destination to see activities</div>');
    return;
  }
  const dest = destinations.find(d => d.id === state.selectedDestination);
  dest.activities.forEach(a => {
    const btn = $(`<button class="btn activity-btn" data-id="${a.id}" data-price="${a.price}" type="button">${a.title} <small class="d-block small-note">₹${a.price}</small></button>`);
    if (state.selectedActivities.some(x => x.id === a.id)) btn.addClass('active');
    $('#activitiesList').append(btn);
  });
}

function updateBudget() {
  const accPricePerNight = Number($('#accommodationSelect option:selected').data('price') || 0);
  const transportPrice = Number($('#transportSelect option:selected').data('price') || 0);

  const start = $('#startDate').val();
  const end = $('#endDate').val();
  let nights = 0;
  if (start && end) {
    const diff = (new Date(end) - new Date(start)) / (1000*60*60*24);
    nights = diff > 0 ? diff : 0;
  }

  const accommodation = accPricePerNight * nights;
  let transport = transportPrice;
  if ($('#transportSelect').val() === 'car') transport *= nights;

  const activitiesFromPicker = state.selectedActivities.reduce((sum, a) => sum + Number(a.price || 0), 0);
  const activitiesFromItinerary = state.itinerary.reduce((sum, it) => sum + Number(it.cost || 0), 0);
  const activities = activitiesFromPicker + activitiesFromItinerary;

  $('#budgetAccommodation').text(`₹${accommodation}`);
  $('#budgetTransport').text(`₹${transport}`);
  $('#budgetActivities').text(`₹${activities}`);
  $('#budgetTotal').text(`₹${accommodation + transport + activities}`);
}

function renderItinerary() {
  $('#itineraryList').empty();
  if (!state.itinerary.length) {
    $('#itineraryList').append('<div class="small-note">No items in itinerary yet.</div>');
    return;
  }
  state.itinerary.forEach((it, idx) => {
    const item = $(`
      <div class="list-group-item d-flex justify-content-between align-items-start">
        <div>
          <div class="fw-bold">${it.title}</div>
          <div class="small-note">${it.date || ''} ${it.time || ''}</div>
          <div class="small-note">₹${it.cost || 0}</div>
        </div>
        <div>
          <button class="btn btn-sm btn-danger remove-itinerary" data-idx="${idx}">Remove</button>
        </div>
      </div>
    `);
    $('#itineraryList').append(item);
  });
}

$(function() {
  renderDestinations();
  renderActivities();
  renderItinerary();
  updateBudget();

  $('#interestFilter, #searchBox').on('input change', renderDestinations);

  $(document).on('click', '.select-destination', function() {
    const id = Number($(this).closest('.destination-card').data('id'));
    state.selectedDestination = id;
    state.selectedActivities = [];
    $('.destination-card').removeClass('selected');
    $(this).closest('.destination-card').addClass('selected');
    renderActivities();
    updateBudget();
  });

  $(document).on('click', '.destination-card', function(e) {
    if ($(e.target).is('.select-destination')) return;
    const id = Number($(this).data('id'));
    state.selectedDestination = id;
    state.selectedActivities = [];
    $('.destination-card').removeClass('selected');
    $(this).addClass('selected');
    renderActivities();
    updateBudget();
  });

  $(document).on('click', '.activity-btn', function() {
    const id = $(this).data('id');
    const dest = destinations.find(d => d.id === state.selectedDestination);
    const activityObj = dest.activities.find(a => a.id === id);
    const index = state.selectedActivities.findIndex(a => a.id === id);
    if (index === -1) {
      state.selectedActivities.push(activityObj);
      $(this).addClass('active');
    } else {
      state.selectedActivities.splice(index, 1);
      $(this).removeClass('active');
    }
    updateBudget();
  });

  $('#accommodationSelect, #transportSelect, #startDate, #endDate').on('change', updateBudget);

  $('#addActivityBtn').on('click', function() {
    const title = $('#activityTitle').val().trim();
    const date = $('#activityDate').val();
    const time = $('#activityTime').val();
    const cost = Number($('#activityCost').val() || 0);
    if (!title) { alert('Please enter an activity title'); return; }
    state.itinerary.push({ title, date, time, cost });
    $('#activityTitle, #activityDate, #activityTime, #activityCost').val('');
    renderItinerary();
    updateBudget();
  });

  $(document).on('click', '.remove-itinerary', function() {
    const idx = Number($(this).data('idx'));
    state.itinerary.splice(idx, 1);
    renderItinerary();
    updateBudget();
  });

  $('#saveTripBtn').on('click', function() {
    const trip = {
      name: $('#tripName').val(),
      startDate: $('#startDate').val(),
      endDate: $('#endDate').val(),
      destination: state.selectedDestination,
      accommodation: $('#accommodationSelect').val(),
      transport: $('#transportSelect').val(),
      activities: state.selectedActivities,
      itinerary: state.itinerary
    };
    localStorage.setItem('holidayPlannerTrip', JSON.stringify(trip));
    alert('Trip saved to LocalStorage');
  });

  $('#clearTripBtn').on('click', function() {
    if (!confirm('Clear current trip?')) return;
    state = { selectedDestination: null, selectedActivities: [], itinerary: [] };
    $('#tripName, #startDate, #endDate').val('');
    $('#accommodationSelect, #transportSelect').val('none');
    $('.destination-card').removeClass('selected');
    renderActivities();
    renderItinerary();
    updateBudget();
  });

  const saved = localStorage.getItem('holidayPlannerTrip');
  if (saved) {
    const trip = JSON.parse(saved);
    if (trip.name) $('#tripName').val(trip.name);
    if (trip.startDate) $('#startDate').val(trip.startDate);
    if (trip.endDate) $('#endDate').val(trip.endDate);
    if (trip.destination) state.selectedDestination = trip.destination;
    if (trip.activities) state.selectedActivities = trip.activities;
    if (trip.itinerary) state.itinerary = trip.itinerary;
    renderDestinations();
    renderActivities();
    renderItinerary();
    updateBudget();
  }
});
