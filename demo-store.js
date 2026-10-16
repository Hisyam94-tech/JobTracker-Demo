/* Browser-local demo data, reset at each local clock hour. No backend. */
(() => {
    'use strict';
    // Remove old formats that have no hourly expiry.
    for (const key of ['jobtracker-demo-v1', 'jobtracker-demo-profile-v1']) {
        try { localStorage.removeItem(key); }
        catch { console.warn('Legacy demo storage could not be cleared because browser storage is unavailable.'); }
    }
    const KEY = 'jobtracker-demo-hourly-v1';
    function clockHour() {
        const now = new Date();
        now.setMinutes(0,0,0);
        return now.getTime();
    }
    const openedHour = clockHour();
    function checkHour() {
        if (clockHour() === openedHour) return false;
        // Another tab may already have started the new hour. Keep its fresh data.
        const raw = localStorage.getItem(KEY);
        if (raw && JSON.parse(raw).hour !== clockHour()) localStorage.removeItem(KEY);
        window.location.reload();
        return true;
    }
    function watchHour() {
        if (checkHour()) return;
        const next = new Date();
        next.setMinutes(60,0,0);
        setTimeout(watchHour, Math.max(50, next.getTime() - Date.now() + 50));
    }
    for (const event of ['focus','pageshow']) window.addEventListener(event, checkHour);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) checkHour();
    });
    watchHour();
    function seed() {
        const date = days => {
            const d = new Date(); d.setDate(d.getDate() - days);
            return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        };
        const names = ['Alex Tan','Maya Lim','Daniel Lee','Sara Wong','Amir Chen','Emma Ng'];
        const devices = ['iPhone 13','Samsung Galaxy S22','Dell Latitude 5420','iPad Air','MacBook Air','Nintendo Switch'];
        const repairs = ['Screen replacement','Battery replacement','Charging port repair','Display repair','Keyboard replacement','Cooling fan service'];
        const repair_orders = Array.from({length:24}, (_,i) => {
            const status = i<6?'in-progress':i<20?'completed':i<22?'Pending-Payment':'cancelled';
            const days = i<12?i:15+(i-12)*13;
            const cost = [280,150,190,320,240,120][i%6];
            return {id:i+1,order_number:`CC${String(i+1).padStart(5,'0')}`,
                customer_name:names[i%6],phone:`010-000-${String(i%6+1).padStart(4,'0')}`,
                email:`demo${i%6+1}@example.com`,device:devices[i%6],issue:repairs[i%6],
                status,date_received:date(days+3),end_date:status==='completed'?date(days):null,
                estimated_cost:cost,images:[],components_changed:[{id:i+1,name:repairs[i%6],cost}],
                updates:[{text:status==='completed'?'Repair tested and ready for collection.':'Device received for inspection.',date:date(days)+'T09:00:00',user:'Demo Technician'}],
                created_at:date(days+3)+'T09:00:00',updated_at:date(days)+'T10:00:00'};
        });
        const spare_parts = ['iPhone 13 Display','Galaxy S22 Battery','USB-C Charging Port','iPad Air Display','Laptop Keyboard','Cooling Fan','Speaker Module','Camera Module'].map((name,i)=>({
            id:i+1,part_number:`DEMO-P${String(i+1).padStart(3,'0')}`,part_name:name,
            description:'Sample inventory item for demonstration',quantity:[12,3,18,0,7,2,15,9][i],
            unit_price:[180,65,25,210,90,35,20,75][i],supplier:'Demo Parts Supply',
            location:`Shelf ${String.fromCharCode(65+i%3)}${i+1}`,min_quantity:5,
            category:['Screen','Battery','Charging Port','Screen','Other','Other','Speaker','Camera'][i]}));
        return {version:1,repair_orders,spare_parts,nextId:25,nextOrder:25,profile:{name:'My Name',bio:'',image:''}};
    }
    function write(state) {
        if (checkHour()) throw new Error('The demo has reset for the new hour.');
        try { localStorage.setItem(KEY, JSON.stringify({hour:openedHour,state})); }
        catch { throw new Error('Could not save demo changes. Browser storage is full or unavailable.'); }
    }
    function read() {
        if (checkHour()) throw new Error('The demo has reset for the new hour.');
        const raw = localStorage.getItem(KEY);
        if (!raw) return seed();
        const saved = JSON.parse(raw);
        if (saved.hour !== openedHour) {
            localStorage.removeItem(KEY);
            return seed();
        }
        return saved.state;
    }
    function table(state,name) {
        if(!['repair_orders','spare_parts'].includes(name))throw new Error('Unknown demo collection.');
        return state[name];
    }
    window.DemoStore = Object.freeze({
        list(name){return table(read(),name);},
        profile(){return read().profile;},
        saveProfile(profile){const state=read();state.profile=profile;write(state);},
        nextOrderNumber(){return `CC${String(read().nextOrder).padStart(5,'0')}`;},
        save(name,row){
            const state=read(),rows=table(state,name);
            const unique=name==='spare_parts'?'part_number':'order_number';
            if(rows.some(r=>r.id!==row.id && r[unique]===row[unique]))throw new Error('This number already exists. Please use a unique number.');
            if(name==='spare_parts' && (!Number.isInteger(row.quantity)||row.quantity<0||!Number.isInteger(row.min_quantity)||row.min_quantity<0||!Number.isFinite(row.unit_price)||row.unit_price<0))
                throw new Error('Stock quantities must be whole non-negative numbers and prices cannot be negative.');
            if(row.id!=null){
                const i=rows.findIndex(r=>r.id===row.id);
                if(i<0)throw new Error('This demo record no longer exists.');
                rows[i]={...rows[i],...row,updated_at:new Date().toISOString()};
            } else {
                rows.unshift({...row,id:state.nextId++,created_at:new Date().toISOString()});
                if(name==='repair_orders')state.nextOrder++;
            }
            write(state);
        },
        remove(name,id){const state=read();state[name]=table(state,name).filter(r=>r.id!==id);write(state);},
        reset(){write(seed());}
    });
})();
