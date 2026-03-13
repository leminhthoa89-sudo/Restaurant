// Game State
let gameState = {
    money: 10,     // Start with $10 to buy initial stock
    level: 1,
    reputation: 5.0,
    slots: 2,      // Default 2 slots now
    maxSlots: 4,
    speedMultiplier: 1,
    tray: [],      
    maxTray: 3,
    // Leaderboard & Player info
    playerName: "Barista",
    
    // Day Mechanics
    day: 1,
    unlockedCategories: ['juice', 'ice_cream'],
    unlockedItems: ['juice_orange', 'ice_vanilla'],
    timeMinutes: 540, // 09:00 AM = 9 * 60 = 540
    endTime: 1020,    // 05:00 PM = 17 * 60 = 1020
    isDayActive: true,
    dayStats: {
        revenue: 0,
        cogs: 0,
        tips: 0
    },
    activeQuest: null,
    totalEarnings: parseInt(localStorage.getItem('totalEarnings') || '0'),
    
    // V19 Progression
    unlockedCategoryIndex: 1, 
    boughtTrayCount: 0,
    equipmentPrice: 200,
    trayPrice: 200,
    inventory: {}, 
    stockAge: {},  
    closedItems: [], // Items user decided to stop selling today
    isLoggedIn: false
};

// Item Data structured by Categories
const MENU_CATEGORIES = {
    juice: { name: "Juices", reqLvl: 1 },
    ice_cream: { name: "Ice Creams", reqLvl: 1 },
    coffee: { name: "Coffees", reqLvl: 2 },
    milk_tea: { name: "Milk Teas", reqLvl: 3 },
    yogurt: { name: "Yogurts", reqLvl: 4 }
};

// Added 'cost' to track Cost of Goods Sold (COGS)
// 3-4 flavors max per category for cleaner UI
const MENU = {
    // Juices
    juice_orange: { cat: 'juice', name: 'Orange', price: 5, cost: 2, time: 1000, color: '#fed7aa', icon: '🥤', rawIcon: '🍊' },
    juice_apple: { cat: 'juice', name: 'Apple', price: 5, cost: 2, time: 1000, color: '#bbf7d0', icon: '🥤', rawIcon: '🍏' },
    juice_watermelon: { cat: 'juice', name: 'Melon', price: 6, cost: 3, time: 1200, color: '#fecdd3', icon: '🥤', rawIcon: '🍉' },
    // Ice Creams
    ice_vanilla: { cat: 'ice_cream', name: 'Vanilla', price: 8, cost: 4, time: 1500, color: '#fef3c7', icon: '🍦', rawIcon: '🥛' },
    ice_choco: { cat: 'ice_cream', name: 'Choco', price: 9, cost: 4, time: 1500, color: '#9a3412', icon: '🍦', rawIcon: '🍫' },
    ice_berry: { cat: 'ice_cream', name: 'Berry', price: 9, cost: 4, time: 1800, color: '#fbcfe8', icon: '🍦', rawIcon: '🍓' },
    // Coffees
    coffee_black: { cat: 'coffee', name: 'Black', price: 15, cost: 5, time: 2000, color: '#1c1917', icon: '☕' },
    coffee_milk: { cat: 'coffee', name: 'Latte', price: 18, cost: 6, time: 2200, color: '#d6d3d1', icon: '🥛' },
    coffee_cap: { cat: 'coffee', name: 'Cappu', price: 20, cost: 8, time: 2500, color: '#a8a29e', icon: '🤎' },
    // Milk Teas
    tea_classic: { cat: 'milk_tea', name: 'Classic', price: 25, cost: 10, time: 2500, color: '#fed7aa', icon: '🧋' },
    tea_taro: { cat: 'milk_tea', name: 'Taro', price: 28, cost: 12, time: 2800, color: '#e9d5ff', icon: '💜' },
    tea_matcha: { cat: 'milk_tea', name: 'Matcha', price: 28, cost: 12, time: 2800, color: '#bbf7d0', icon: '🍵' },
    // Yogurts
    yogurt_plain: { cat: 'yogurt', name: 'Plain', price: 30, cost: 15, time: 3000, color: '#f8fafc', icon: '🥣' },
    yogurt_berry: { cat: 'yogurt', name: 'Berry', price: 35, cost: 18, time: 3200, color: '#fbcfe8', icon: '🫐' }
};

// Upgrade Costs
let costs = {
    slot: 200,
    speed: 75,
    tray: 200,
    equipment: 200
};

const els = {
    moneyAmount: document.getElementById('money-amount'),
    repDisplay: document.getElementById('reputation-stars'),
    timeVal: document.getElementById('time-val'),
    dayCount: document.getElementById('day-count'),
    
    slotsContainer: document.getElementById('bar-slots-container'),
    menuBoard: document.getElementById('menu-board'),
    
    // Tray
    holdingTray: document.getElementById('holding-tray'),
    trayCount: document.getElementById('tray-count'),
    trayMax: document.getElementById('tray-max'),
    
    // Upgrades Modal
    upgradesBtn: document.getElementById('upgrades-btn'),
    upgradesModal: document.getElementById('upgrades-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    
    buySlotBtn: document.getElementById('buy-table-btn'),
    buySpeedBtn: document.getElementById('buy-speed-btn'),
    buyTrayBtn: document.getElementById('buy-tray-btn'),
    slotCountView: document.getElementById('table-count-view'),
    
    // EOD Modal
    eodModal: document.getElementById('eod-modal'),
    eodDayNum: document.getElementById('eod-day-num'),
    eodRevenue: document.getElementById('eod-revenue'),
    eodCogs: document.getElementById('eod-cogs'),
    eodTips: document.getElementById('eod-tips'),
    eodProfit: document.getElementById('eod-profit'),
    nextDayBtn: document.getElementById('start-next-day-btn'),
    
    // Inventory
    supplyModal: document.getElementById('supply-modal'),
    supplyGrid: document.getElementById('supply-grid'),
    supplyMoney: document.getElementById('supply-money-val'),
    startAfterSupplyBtn: document.getElementById('start-day-after-supply-btn'),
    
    // Leaderboard Modal
    leaderboardBtn: document.getElementById('leaderboard-btn'),
    leaderboardModal: document.getElementById('leaderboard-modal'),
    closeLbBtn: document.getElementById('close-lb-btn'),
    lbList: document.getElementById('lb-list'),
    
    // Upgrades
    upgTray: document.getElementById('upg-tray'),
    upgEquipment: document.getElementById('upg-equipment'),
    closeLbBtn: document.getElementById('close-lb-btn'),
    lbList: document.getElementById('lb-list'),
    
    notifications: document.getElementById('notifications-container'),

    // Auth
    authBtn: document.getElementById('auth-btn'),
    authModal: document.getElementById('auth-modal'),
    closeAuthBtn: document.getElementById('close-auth-btn'),
    authUsername: document.getElementById('auth-username'),
    authPass: document.getElementById('auth-password'),
    btnLogin: document.getElementById('btn-login'),
    btnRegister: document.getElementById('btn-register'),
    authError: document.getElementById('auth-error'),

    // Upgrade Cards & Buttons
    upgEquipment: document.getElementById('upg-equipment'),
    buyEquipmentBtn: document.getElementById('buy-equipment-btn'),
    upgTray: document.getElementById('upg-tray'),
    
    // Quests
    questDesc: document.getElementById('quest-desc'),
    questBarFill: document.getElementById('quest-progress-fill'),
    questText: document.getElementById('quest-progress-text'),
    
    // PvP HUD
    opponentHud: document.getElementById('opponent-hud'),
    opponentMoney: document.getElementById('opponent-money'),
};

const customerEmojis = ['👩🏼', '👨🏽', '👱🏻‍♂️', '👧🏾', '👵🏼', '🧔🏻‍♂️', '👩🏽‍🦱', '👨🏻‍🦰'];
let slotStates = []; // Matches gameState.slots
for(let i=0; i<4; i++) slotStates.push({ status: 'empty' });

let tableStates = []; // 4 Background dining tables
for(let i=0; i<4; i++) tableStates.push({ status: 'empty' });

// -- Initialization --

function initGame() {
    let storedName = localStorage.getItem('baristaName');
    if (!storedName) {
        storedName = prompt("Welcome to your new Coffee Shop! What's your name?", "Barista");
        localStorage.setItem('baristaName', storedName || "Barista");
    }
    gameState.playerName = storedName || "Barista";
    
    // Toggle PvP HUD
    if(currentMode === 'pvp' || currentMode === 'pvp_bot') {
        els.opponentHud.classList.remove('hidden');
    } else {
        els.opponentHud.classList.add('hidden');
    }
    
    // V22: Init Day 1 Stock for free
    if (gameState.day === 1 && Object.keys(gameState.inventory).length === 0) {
        gameState.unlockedItems.forEach(id => {
            gameState.inventory[id] = 10;
            gameState.stockAge[id] = 0;
        });
    }

    buildMenuUI();
    generateDailyQuest();
    updateHUD();
    renderSlots();
    renderTray();
    updateAppliances();
    setupEventListeners();
    connectWS(); 

    // Mandatory Login Popup
    setTimeout(() => {
        if (!gameState.isLoggedIn) {
            openAuthModal();
        }
    }, 1000);

    // Game Loop
    if (currentMode !== 'coop' || playerRole === 'host') {
        setInterval(gameLoop, 150); 
    }
    
    // Start Bots if playing in bot modes
    if (currentMode === 'pvp_bot') {
        setInterval(simulateOpponentScore, 5000);
    } else if (currentMode === 'coop_bot') {
        setInterval(simulateBusserActions, 2000);
    }
}

function openAuthModal() {
    if (els.authModal) {
        els.authModal.classList.remove('hidden');
        if (els.authError) els.authError.textContent = '';
    }
}

function syncCoopState() {
    if (currentMode === 'coop' && playerRole === 'host' && ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ 
            action: 'SYNC_STATE', 
            eventData: { 
                gameState: gameState, 
                slotStates: slotStates, 
                tableStates: tableStates 
            } 
        }));
    }
}

function buildMenuUI() {
    els.menuBoard.innerHTML = '';
    
    for (const [catKey, catData] of Object.entries(MENU_CATEGORIES)) {
        if (!gameState.unlockedCategories.includes(catKey)) continue;

        els.menuBoard.innerHTML += `<div class="category-title" style="grid-column: 1/-1; color: white; margin-top: 10px; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px;">${catData.name}</div>`;
        
        for (const [itemKey, itemData] of Object.entries(MENU)) {
            if (itemData.cat === catKey) {
                const isLocked = !gameState.unlockedItems.includes(itemKey);
                const stock = gameState.inventory[itemKey] || 0;
                
                let isJuice = catKey === 'juice';
                let isIceCream = catKey === 'ice_cream';
                let iconHTML;
                
                if (isJuice) iconHTML = `<div class="fruit-plate">${itemData.rawIcon}</div>`;
                else if (isIceCream) iconHTML = `
                    <div class="ice-cream-cone" style="transform: scale(0.6); margin: 0;">
                        <div class="scoop" style="background:${itemData.color}; box-shadow: inset -5px -5px 10px rgba(0,0,0,0.1);"></div>
                        <div class="cone"></div>
                    </div>
                `;
                else iconHTML = `<div class="color-icon" style="background:${itemData.color}">${itemData.icon}</div>`;
                    
                let btnHTML = `
                    <button class="menu-item-btn glass-panel ${isLocked ? 'locked' : ''} ${stock <= 0 ? 'out-of-stock' : ''}" data-item="${itemKey}" id="btn-${itemKey}">
                        ${iconHTML}
                        <div class="item-name">${itemData.name}</div>
                        <div class="stock-indicator ${stock < 3 ? 'text-red' : ''}">${stock} left</div>
                    </button>
                `;
                els.menuBoard.innerHTML += btnHTML;
            }
        }
    }
    
    // Attach listeners
    document.querySelectorAll('.menu-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if(!btn.classList.contains('locked') && !btn.disabled) {
                prepareDrink(btn.dataset.item, btn);
            }
        });
    });
}

function showOutOfStockOptions(itemKey, btnElement) {
    const item = MENU[itemKey];
    const isRemoveConfirmed = confirm(`"${item.name}" is OUT OF STOCK!\n\nOK: Emergency Restock 10pcs ($${Math.floor(item.cost * 1.5 * 10)})\nCancel: Close this item for today ($100 fee)`);
    
    if (isRemoveConfirmed) {
        // Restock
        const restockCost = Math.floor(item.cost * 1.5 * 10);
        if (gameState.money >= restockCost) {
            gameState.money -= restockCost;
            gameState.inventory[itemKey] = 10;
            showNotification(`Restocked ${item.name}!`, "success");
            updateHUD();
            buildMenuUI();
        } else {
            showNotification("Not enough money for emergency restock!", "error");
        }
    } else {
        // Close item
        if (gameState.money >= 100) {
            gameState.money -= 100;
            gameState.closedItems.push(itemKey);
            showNotification(`${item.name} closed for today.`, "info");
            updateHUD();
            buildMenuUI();
        } else {
            showNotification("Not enough money to close the item!", "error");
        }
    }
}

function formatTime(minutes) {
    let h = Math.floor(minutes / 60);
    let m = Math.floor(minutes % 60);
    let ampm = h >= 12 ? 'PM' : 'AM';
    let displayH = h % 12;
    if (displayH === 0) displayH = 12;
    
    return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function updateHUD() {
    if(els.moneyAmount) els.moneyAmount.textContent = gameState.money;
    if(els.slotCountView) els.slotCountView.textContent = gameState.slots;
    if(els.dayCount) els.dayCount.textContent = gameState.day;
    if(els.timeVal) els.timeVal.textContent = formatTime(gameState.timeMinutes);
    
    // Quest UI
    if (gameState.activeQuest) {
        let q = gameState.activeQuest;
        els.questDesc.textContent = q.desc;
        els.questText.textContent = `${q.current}/${q.target}`;
        els.questBarFill.style.width = `${Math.min(100, (q.current / q.target) * 100)}%`;
        if (q.completed) els.questBarFill.style.background = '#3b82f6'; // turn blue when done
        else els.questBarFill.style.background = '#10b981';
    }
    
    // Update Reputation Display
    let starsHTML = `${gameState.reputation.toFixed(1)} `;
    let repInt = Math.round(gameState.reputation);
    for(let i=1; i<=5; i++) {
        if (i <= repInt) starsHTML += '<i class="fa-solid fa-star"></i>';
        else starsHTML += '<i class="fa-regular fa-star"></i>';
    }
    els.repDisplay.innerHTML = starsHTML;
    
    // Update Tray info
    els.trayCount.textContent = gameState.tray.length;
    els.trayMax.textContent = gameState.maxTray;
    
    // Update upgrades
    els.buySlotBtn.disabled = gameState.money < costs.slot || gameState.slots >= gameState.maxSlots;
    if (gameState.slots >= gameState.maxSlots) els.buySlotBtn.textContent = "MAX";
    else els.buySlotBtn.innerHTML = `$${costs.slot}`;
    
    // Speed and Tray Logic
    if(els.buySpeedBtn) {
        els.buySpeedBtn.disabled = gameState.money < costs.speed;
    }
    
    // Tray Capacity (Day 10+)
    const canBuyTray = gameState.day >= 10;
    els.upgTray.classList.toggle('locked', !canBuyTray);
    els.buyTrayBtn.innerHTML = `$${gameState.trayPrice}`;
    els.buyTrayBtn.disabled = !canBuyTray || gameState.money < gameState.trayPrice || gameState.maxTray >= 10;
    if (gameState.maxTray >= 10) els.buyTrayBtn.textContent = "MAX";

    // Equipment (Day 5+)
    const totalCats = Object.keys(MENU_CATEGORIES).length;
    const canBuyEquip = gameState.day >= 5 && gameState.unlockedCategoryIndex < totalCats - 1;
    els.upgEquipment.classList.toggle('locked', !canBuyEquip);
    els.buyEquipmentBtn.innerHTML = `$${gameState.equipmentPrice}`;
    els.buyEquipmentBtn.disabled = !canBuyEquip || gameState.money < gameState.equipmentPrice;
    if (gameState.unlockedCategoryIndex >= totalCats - 1) els.buyEquipmentBtn.textContent = "UNLOCKED ALL";

    // Broadcast Score in PvP
    if (currentMode === 'pvp' && ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ action: 'SCORE_UPDATE', score: gameState.dayStats.revenue }));
    }
    
    // Broadcast State in Co-op
    syncCoopState();
}

function updateAppliances() {
    for (const catKey of Object.keys(MENU_CATEGORIES)) {
        let appEl = document.getElementById(`app-${catKey}`);
        if(appEl) {
            if(gameState.unlockedCategories.includes(catKey)) {
                appEl.classList.remove('locked');
            } else {
                appEl.classList.add('locked');
            }
        }
    }
}

// -- Render Customer Slots --
function renderSlots() {
    els.slotsContainer.innerHTML = '';
    for (let i = 0; i < gameState.slots; i++) {
        let wrapper = document.createElement('div');
        wrapper.className = 'bar-slot';
        wrapper.dataset.id = i;
        els.slotsContainer.appendChild(wrapper);
        updateSlotUI(i);
    }
}

// -- Customer Logic & Timer Loop --

function getUnlockedItems() {
    return [...gameState.unlockedItems];
}

function gameLoop() {
    if (!gameState.isDayActive) return;
    
    // Tick Time
    gameState.timeMinutes += 1;
    
    // Scale Slots after Day 5
    if (gameState.day >= 5 && gameState.slots < 3) {
        gameState.slots = 3;
        renderSlots();
    }
    
    updateHUD();
    
    if (gameState.timeMinutes >= gameState.endTime) {
        endDay();
        return;
    }
    
    // Spawn Logic (Once per 2 ticks roughly so they appear often in an 8-minute day)
    if (gameState.timeMinutes % 2 === 0) {
        let spanwRateProgression = Math.min(5, Math.floor(gameState.day / 3)); // caps out at day 15
        let spawnChance = 0.5 + (spanwRateProgression * 0.1); 
        if (Math.random() < spawnChance) {
            let emptySlots = [];
            for (let i = 0; i < gameState.slots; i++) {
                if (slotStates[i].status === 'empty') emptySlots.push(i);
            }
            
            if (emptySlots.length > 0) {
                let sId = emptySlots[Math.floor(Math.random() * emptySlots.length)];
                spawnCustomer(sId);
            }
        }
    }
    
    // Patience Timers (Only reduce for the one "Active" customer who came first)
    let oldestTime = Infinity;
    let activeCustomerSlot = -1;
    
    // Find who has been waiting the longest
    for (let i = 0; i < gameState.slots; i++) {
        let state = slotStates[i];
        if (state.status === 'waiting') {
            if (state.spawnTime < oldestTime) {
                oldestTime = state.spawnTime;
                activeCustomerSlot = i;
            }
        }
    }
    
    // Only decrement patience for that specific active customer
    if (activeCustomerSlot > -1) {
        let state = slotStates[activeCustomerSlot];
        state.patience -= 1; // Decrement 1 second per tick
        updatePatienceUI(activeCustomerSlot); 
        
        if (state.patience <= 0) {
            // Customer abandons angrily
            handleCustomerLeave(activeCustomerSlot, true);
        }
    }
}

function spawnCustomer(slotId) {
    let emoji = customerEmojis[Math.floor(Math.random() * customerEmojis.length)];
    // V22: Only allow items that aren't closed
    let itemsAllowed = getUnlockedItems().filter(id => !gameState.closedItems.includes(id));
    
    if (itemsAllowed.length === 0) {
        console.warn("No items allowed to spawn customer!");
        return;
    }
    
    // Decide number of orders: 1 item before Day 10, 1-3 after Day 10
    let maxItems = 1;
    if (gameState.day >= 10) {
        maxItems = Math.floor(Math.random() * 3) + 1;
    }
    
    let orders = [];
    for(let i=0; i<maxItems; i++) {
        orders.push(itemsAllowed[Math.floor(Math.random() * itemsAllowed.length)]);
    }
    
    slotStates[slotId] = {
        status: 'waiting',
        customer: emoji,
        orders: orders,
        maxPatience: 60,
        patience: 60,
        moneyOwed: 0,
        tipsGiven: 0,
        spawnTime: gameState.timeMinutes
    };
    
    updateSlotUI(slotId);
    checkTrayMatches();
}


function checkTrayMatches() {
    // Check if any item in tray can be served to any customer
    const itemsInTray = [...gameState.tray];
    for(let i=0; i<gameState.slots; i++) {
        let state = slotStates[i];
        if(state.status === 'waiting') {
            state.orders.forEach(itemKey => {
                // To-be-implemented matching logic
            });
        }
    }
}

function updateSlotUI(slotId) {
    let wrapper = els.slotsContainer.children[slotId];
    if(!wrapper) return;
    
    let state = slotStates[slotId];
    wrapper.innerHTML = '';
    
    if (state.status === 'waiting' || state.status === 'eating' || state.status === 'dirty') {
        let customerHTML = `<div class="customer-figure">`;
        
        // Patience Bar setup
        if (state.status === 'waiting') {
            let pct = (state.patience / state.maxPatience) * 100;
            let bgColor = pct > 50 ? '#10b981' : (pct > 25 ? '#f59e0b' : '#ef4444');
            customerHTML += `
                <div class="patience-container">
                    <div class="patience-bar" style="width: ${pct}%; background-color: ${bgColor};"></div>
                </div>
            `;
        }
        
        // Face
        customerHTML += `${state.customer}</div>`;
        
        // Orders display
        let bubbleHTML = '<div class="orders-container">';
        if (state.status === 'waiting') {
            state.orders.forEach(orderKey => {
                if(MENU[orderKey]) {
                    let item = MENU[orderKey];
                    let displayIcon = item.rawIcon || item.icon;
                    
                    if (item.cat === 'ice_cream') {
                        let html = `
                            <div class="ice-cream-cone" style="transform: scale(0.6); margin-top: -10px;">
                                <div class="scoop" style="background:${item.color}; box-shadow: inset -5px -5px 10px rgba(0,0,0,0.1);"></div>
                                <div class="cone"></div>
                            </div>
                        `;
                        bubbleHTML += `<div class="thought-bubble" style="border: 2px solid ${item.color}">${html}</div>`;
                    } else {
                        bubbleHTML += `<div class="thought-bubble" style="border: 2px solid ${item.color}">${displayIcon}</div>`;
                    }
                }
            });
        } else if (state.status === 'eating') {
            bubbleHTML += `<div class="thought-bubble">😋</div>`;
        } else if (state.status === 'dirty') {
            customerHTML = `<div class="customer-figure" style="cursor: pointer;" onclick="cleanSlot(${slotId})">🗑️</div>`;
            bubbleHTML = `<div class="orders-container"><div class="thought-bubble" style="border-color:#ef4444;">Needs Cleaning!</div></div>`;
        }
        bubbleHTML += '</div>';
        
        wrapper.innerHTML = customerHTML + bubbleHTML;
    }
}

function updatePatienceUI(slotId) {
    let wrapper = els.slotsContainer.children[slotId];
    if(!wrapper) return;
    
    let state = slotStates[slotId];
    if(state.status === 'waiting') {
        let bar = wrapper.querySelector('.patience-bar');
        if(bar) {
            let pct = (state.patience / state.maxPatience) * 100;
            let bgColor = pct > 50 ? '#10b981' : (pct > 25 ? '#f59e0b' : '#ef4444');
            bar.style.width = `${pct}%`;
            bar.style.backgroundColor = bgColor;
        }
    }
}

function collectMoney(slotId) {
    let state = slotStates[slotId];
    let total = state.moneyOwed + state.tipsGiven;
    
    gameState.money += total;
    gameState.dayStats.revenue += state.moneyOwed;
    gameState.dayStats.tips += state.tipsGiven;
    
    // Track lifetime earnings for ranking
    gameState.totalEarnings += total;
    localStorage.setItem('totalEarnings', gameState.totalEarnings);
    
    showFloatingText(`+$${total}`, els.slotsContainer.children[slotId]);
    
    // Quest Progress: Collect Revenue
    progressQuest('revenue', state.moneyOwed);
    // Quest Progress: Serve Customers
    progressQuest('customers', 1);
    
    updateHUD();
}

// -- Serving Logic --
function serveFromTray(trayIndex) {
    // Find a customer who needs this item
    let itemKey = gameState.tray[trayIndex];
    let matchedSlotId = -1;
    let orderIndex = -1;

    for (let i = 0; i < gameState.slots; i++) {
        let state = slotStates[i];
        if (state.status === 'waiting') {
            // Find the first index of the item that hasn't been served yet
            let idx = state.orders.findIndex((key, j) => {
                let servedIndices = state.itemsServed || [];
                return key === itemKey && !servedIndices.includes(j);
            });
            if (idx !== -1) {
                matchedSlotId = i;
                orderIndex = idx;
                break;
            }
        }
    }

    if (matchedSlotId !== -1) {
        let state = slotStates[matchedSlotId];
        if (!state.itemsServed) state.itemsServed = [];
        state.itemsServed.push(orderIndex);
        
        // Remove from tray
        gameState.tray.splice(trayIndex, 1);
        
        // Accumulate price
        let itemPrice = MENU[itemKey].price;
        state.moneyOwed += itemPrice;
        state.tipsGiven += Math.floor(itemPrice * 0.1); // 10% tip for matched item
        
        showNotification(`Served ${MENU[itemKey].icon}!`, 'success');
        
        // Check if fully served
        if (state.itemsServed.length === state.orders.length) {
            handleCustomerLeave(matchedSlotId, false);
        } else {
            updateSlotUI(matchedSlotId);
            renderTray();
            syncCoopState();
        }
    } else {
        showNotification("No one is waiting for that right now.", 'error');
    }
}

function handleCustomerLeave(slotId, angry = false) {
    let state = slotStates[slotId];
    let wrapper = els.slotsContainer.children[slotId];
    if (!wrapper) return;

    if (angry) {
        showFloatingText("Angry!", wrapper, true);
        gameState.reputation = Math.max(1, gameState.reputation - 0.5);
        state.status = 'empty';
    } else {
        collectMoney(slotId);
        state.status = 'empty';
    }
    
    // Animate exit
    let fig = wrapper.querySelector('.customer-char');
    if(fig) fig.classList.add('leaving');
    
    setTimeout(() => {
        state.status = 'empty';
        state.orders = [];
        state.itemsServed = [];
        updateSlotUI(slotId);
        updateHUD();
    }, 500);
}

// -- Making Drinks (Appliances) & Tray --

function renderTray() {
    els.holdingTray.innerHTML = '';
    
    // Check what customers need right now
    let neededItems = new Set();
    for(let i=0; i<gameState.slots; i++) {
        if(slotStates[i] && slotStates[i].status === 'waiting') {
            slotStates[i].orders.forEach(o => neededItems.add(o));
        }
    }
    
    for(let i=0; i<gameState.maxTray; i++) {
        let slot = document.createElement('div');
        
        if (i < gameState.tray.length) {
            let itemKey = gameState.tray[i];
            let item = MENU[itemKey];
            slot.className = 'tray-slot' + (neededItems.has(itemKey) ? ' matched' : '');
            slot.style.borderColor = item.color;
            
            // Item Content
            let content = '';
            if (item.cat === 'juice') {
                content = `<div class="plastic-cup"><div class="liquid" style="background:${item.color};"></div><div class="cup-label">${item.rawIcon}</div></div>`;
            } else {
                content = `<div class="color-icon" style="background:${item.color}">${item.icon}</div>`;
            }
            
            // Trash Icon
            let trash = `<div class="tray-discard" onclick="event.stopPropagation(); discardFromTray(${i})">🗑️</div>`;
            
            slot.innerHTML = content + trash;
            slot.onclick = () => serveFromTray(i);
        } else {
            slot.className = 'tray-slot empty';
        }
        
        els.holdingTray.appendChild(slot);
    }
    updateHUD();
}

function prepareDrink(itemKey, btnElement) {
    let item = MENU[itemKey];
    let appEl = document.getElementById(`app-${item.cat}`);
    
    if (appEl && appEl.classList.contains('active')) {
        showFloatingText("Appliance is busy!", btnElement, true);
        return;
    }
    
    if (gameState.tray.length >= gameState.maxTray) {
        showFloatingText("Tray Full!", btnElement, true);
        return;
    }
    // V22: Check Stock
    const stock = gameState.inventory[itemKey] || 0;
    if (stock <= 0) {
        showOutOfStockOptions(itemKey, btnElement);
        return;
    }

    // Deduct stock (cost is paid during Pre-Day buy, or Emergency)
    gameState.inventory[itemKey]--;
    gameState.stockAge[itemKey] = 0; // Reset age if used

    gameState.dayStats.cogs += item.cost;
    updateHUD();
    buildMenuUI(); // Refresh stock counts
    
    // Lock buttons of the same category during prep
    let allBtns = document.querySelectorAll('.menu-item-btn:not(.locked)');
    allBtns.forEach(b => {
        let bKey = b.getAttribute('data-item');
        if (MENU[bKey] && MENU[bKey].cat === item.cat) {
            b.classList.add('preparing');
        }
    });
    
    // Activate appropriate appliance
    if(appEl) appEl.classList.add('active');
    
    // Button visual: show what's happening based on category
    let originalHtml = btnElement.innerHTML;
    
    if (item.cat === 'juice') {
        btnElement.innerHTML = `<div class="fruit-plate animate-toss">${item.rawIcon}</div><div class="item-name">Blending...</div>`;
    } else if (item.cat === 'ice_cream') {
        btnElement.innerHTML = `
            <div class="ice-cream-cone animate-dispense">
                <div class="scoop" style="background:${item.color};"></div>
            </div><div class="item-name">Swirling...</div>
        `;
    } else {
        btnElement.innerHTML = `<div class="color-icon"><i class="fa-solid fa-spinner fa-spin"></i></div><div class="item-name">Prep...</div>`;
    }
    
    let time = item.time / gameState.speedMultiplier;
    
    setTimeout(() => {
        // Reset Visuals
        allBtns.forEach(b => {
            let bKey = b.getAttribute('data-item');
            if (MENU[bKey] && MENU[bKey].cat === item.cat) {
                b.classList.remove('preparing');
            }
        });
        btnElement.innerHTML = originalHtml;
        if(appEl) appEl.classList.remove('active');
        
        // Push logic
        if (gameState.tray.length < gameState.maxTray) {
            gameState.tray.push(itemKey);
            renderTray();
            gameState.reputation = Math.min(5.0, gameState.reputation + 0.05);
            updateHUD();
        }
    }, time);
}

function serveFromTray(trayIndex) {
    let itemKey = gameState.tray[trayIndex];
    
    // Find customers hungry for this
    let matchingSlots = [];
    for (let i = 0; i < gameState.slots; i++) {
        let state = slotStates[i];
        if (state.status === 'waiting' && state.orders.indexOf(itemKey) > -1) {
            matchingSlots.push({ idx: i, spawnTime: state.spawnTime });
        }
    }
    
    if (matchingSlots.length === 0) {
        let slot = els.holdingTray.children[trayIndex];
        slot.style.animation = 'shake 0.2s';
        setTimeout(() => slot.style.animation = '', 200);
        return;
    }
    
    // Serve the one who arrived first (FIFO)
    matchingSlots.sort((a, b) => a.spawnTime - b.spawnTime);
    let targetSlotIdx = matchingSlots[0].idx;
    let state = slotStates[targetSlotIdx];
    
    // Serve it
    let orderIdx = state.orders.indexOf(itemKey);
    state.orders.splice(orderIdx, 1);
    state.moneyOwed = (state.moneyOwed || 0) + MENU[itemKey].price;
    
    // Quest Progress: Items
    progressQuest('items', 1);
    
    // Add tip logic if served fast (patience > 50%)
    let pct = (state.patience / state.maxPatience);
    if (pct > 0.5) {
        state.tipsGiven = (state.tipsGiven || 0) + 1; 
        if (MENU[itemKey].cat === 'coffee' || MENU[itemKey].cat === 'milk_tea') progressQuest('tips', 1); 
    }
    
    // Add patience back 
    state.patience = Math.min(state.maxPatience, state.patience + 25); 
    
    if (state.orders.length === 0) {
        handleCustomerLeave(targetSlotIdx, false);
    } else {
        updateSlotUI(targetSlotIdx);
    }
    
    gameState.tray.splice(trayIndex, 1);
    renderTray();
}

function discardFromTray(trayIndex) {
    let itemKey = gameState.tray[trayIndex];
    let item = MENU[itemKey];
    let penalty = Math.floor(item.price * 0.8);
    
    gameState.money = Math.max(0, gameState.money - penalty);
    gameState.tray.splice(trayIndex, 1);
    
    showFloatingText(`-$${penalty} Waste`, els.holdingTray.children[trayIndex], true);
    renderTray();
    updateHUD();
}

// -- End of Day Logic --
function endDay() {
    gameState.isDayActive = false;
    
    // Clear out customers who are still waiting
    for (let i = 0; i < gameState.slots; i++) {
        let s = slotStates[i];
        if (s.status !== 'empty') {
            s.status = 'empty';
            s.orders = [];
            updateSlotUI(i);
        }
    }
    
    let revenue = gameState.dayStats.revenue;
    let cogs = gameState.dayStats.cogs;
    let tips = gameState.dayStats.tips;
    let net = revenue + tips - cogs;

    // V22: Carryover & Waste Logic
    let wasteTotal = 0;
    for (let id in gameState.inventory) {
        if (gameState.inventory[id] > 0) {
            gameState.stockAge[id] = (gameState.stockAge[id] || 0) + 1;
            if (gameState.stockAge[id] >= 2) {
                // Waste it (charge 50% of cost as disposal fee)
                const wasteCost = Math.floor(gameState.inventory[id] * MENU[id].cost * 0.5);
                wasteTotal += wasteCost;
                gameState.inventory[id] = 0;
                gameState.stockAge[id] = 0;
            }
        }
    }
    
    gameState.money -= wasteTotal;
    if (wasteTotal > 0) showNotification(`Wasted stock cost: -$${wasteTotal}`, "error");

    els.eodDayNum.textContent = gameState.day;
    els.eodRevenue.textContent = revenue;
    els.eodCogs.textContent = cogs;
    els.eodTips.textContent = tips;
    
    // Profit includes waste
    const totalProfit = net - wasteTotal;
    els.eodProfit.textContent = (totalProfit >= 0 ? `+$${totalProfit}` : `-$${Math.abs(totalProfit)}`);
    els.eodProfit.className = (totalProfit >= 0 ? 'text-green' : 'text-red');
    
    // Save to Leaderboard
    saveLeaderboard(revenue);
    submitScore(); 
    saveGameToServer();
    
    els.eodModal.classList.remove('hidden');
}

function saveLeaderboard(dailyRevenue) {
    if (dailyRevenue <= 0) return;
    
    let board = JSON.parse(localStorage.getItem('baristaLeaderboard') || '[]');
    let me = board.find(x => x.name === gameState.playerName);
    
    if (me) {
        me.revenue += dailyRevenue; // Accumulate over days
        me.day = gameState.day;
    } else {
        board.push({ name: gameState.playerName, revenue: dailyRevenue, day: gameState.day });
    }
    
    // Sort desc 
    board.sort((a,b) => b.revenue - a.revenue);
    localStorage.setItem('baristaLeaderboard', JSON.stringify(board));
}

function renderLeaderboard() {
    let board = JSON.parse(localStorage.getItem('baristaLeaderboard') || '[]');
    els.lbList.innerHTML = '';
    
    if (board.length === 0) {
        els.lbList.innerHTML = '<div class="lb-row">No records yet!</div>';
        return;
    }
    
    board.slice(0, 10).forEach((entry, idx) => {
        els.lbList.innerHTML += `
            <div class="lb-row ${entry.name === gameState.playerName ? 'highlight' : ''}">
                <div class="lb-rank">#${idx + 1}</div>
                <div class="lb-name">${entry.name}</div>
                <div class="lb-day">Day ${entry.day}</div>
                <div class="lb-score">$${entry.revenue}</div>
            </div>
        `;
    });
}

els.nextDayBtn.addEventListener('click', () => {
    els.eodModal.classList.add('hidden');
    
    // Day 2+ starts with supply modal
    if (gameState.day >= 1) {
        openSupplyModal();
    } else {
        startDay(); // Day 1 might be special or handled during init
    }
});

function openSupplyModal() {
    els.supplyMoney.textContent = gameState.money;
    renderSupplyGrid();
    els.supplyModal.classList.remove('hidden');
}

function renderSupplyGrid() {
    els.supplyGrid.innerHTML = '';
    
    // Only show items from unlocked categories
    for (const [id, item] of Object.entries(MENU)) {
        if (!gameState.unlockedCategories.includes(item.cat)) continue;
        
        const currentStock = gameState.inventory[id] || 0;
        const packCost = item.cost * 10;
        
        const card = document.createElement('div');
        card.className = 'supply-card';
        card.innerHTML = `
            <div class="icon">${item.icon}</div>
            <div class="name">${item.name}</div>
            <div class="cost">$${packCost} <small>(10pcs)</small></div>
            <div class="current-stock">In Stock: ${currentStock}</div>
            <button class="glass-btn primary" onclick="buySupplyPack('${id}')" ${gameState.money < packCost ? 'disabled' : ''}>Buy Pack</button>
        `;
        els.supplyGrid.appendChild(card);
    }
}

// Global scope for onclick
window.buySupplyPack = (itemId) => {
    const item = MENU[itemId];
    const packCost = item.cost * 10;
    
    if (gameState.money >= packCost) {
        gameState.money -= packCost;
        gameState.inventory[itemId] = (gameState.inventory[itemId] || 0) + 10;
        gameState.stockAge[itemId] = 0; // Fresh stock
        
        showNotification(`Bought 10x ${item.name}`, "success");
        openSupplyModal(); // Refresh UI
        updateHUD();
    }
};

els.startAfterSupplyBtn.addEventListener('click', () => {
    // Check if at least one item has stock
    let totalStock = Object.values(gameState.inventory).reduce((a, b) => a + b, 0);
    if (totalStock === 0) {
        alert("You need to buy at least some ingredients to open the shop!");
        return;
    }
    
    els.supplyModal.classList.add('hidden');
    startDay();
});

function startDay() {
    gameState.day++;
    gameState.closedItems = []; // Reset closures
    gameState.timeMinutes = 540; // 09:00 AM
    gameState.dayStats = { revenue: 0, cogs: 0, tips: 0 };
    
    generateDailyQuest();
    
    // Clear slots
    for(let i=0; i<gameState.slots; i++) {
        slotStates[i].status = 'empty';
        slotStates[i].orders = [];
        updateSlotUI(i);
    }
    
    processDayProgression();
    
    gameState.isDayActive = true;
    updateHUD();
    buildMenuUI();
}

function processDayProgression() {
    let unlockedSomething = false;
    let nextDay = gameState.day;

    // Check specific day milestones for new categories
    if (nextDay === 5) {
        gameState.unlockedCategories.push('coffee');
        gameState.unlockedItems.push('coffee_black');
        unlockedSomething = true;
        showFloatingText("Espresso Machine Unlocked!", els.timeVal);
    } else if (nextDay === 10) {
        gameState.unlockedCategories.push('milk_tea');
        gameState.unlockedItems.push('tea_classic');
        unlockedSomething = true;
        showFloatingText("Tea Brewer Unlocked!", els.timeVal);
    } else if (nextDay === 15) {
        gameState.unlockedCategories.push('yogurt');
        gameState.unlockedItems.push('yogurt_plain');
        unlockedSomething = true;
        showFloatingText("Yogurt Maker Unlocked!", els.timeVal);
    }

    // Try to unlock 1 random new item from current available categories
    let pool = [];
    for (const [key, data] of Object.entries(MENU)) {
        if (gameState.unlockedCategories.includes(data.cat) && !gameState.unlockedItems.includes(key)) {
            pool.push(key);
        }
    }

    if (pool.length > 0) {
        // Pick random
        let pick = pool[Math.floor(Math.random() * pool.length)];
        gameState.unlockedItems.push(pick);
        unlockedSomething = true;
        showFloatingText("New Recipe Unlocked!", els.timeVal);
    }

    if (unlockedSomething) {
        buildMenuUI();
        updateAppliances();
    }
}

function updateDiningTables() {
    for (let i = 0; i < 4; i++) {
        let el = document.getElementById(`bt-${i}`);
        if(el) {
            if (tableStates[i].status === 'occupied') {
                el.innerHTML = `<div class="sitting-customer">${tableStates[i].customer}</div>`;
            } else if (tableStates[i].status === 'dirty') {
                el.innerHTML = `<div class="sitting-customer" style="cursor: pointer; filter: grayscale(1); font-size:1.5rem;" onclick="cleanTable(${i})">🗑️</div>`;
            } else {
                el.innerHTML = '';
            }
        }
    }
}

// -- Co-Op Cleaning Handlers --
function cleanSlot(slotId) {
    if (currentMode === 'coop' && playerRole === 'joiner' && ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ action: 'ACTION_CLEAN', target: 'slot', id: slotId }));
    }
}

function cleanTable(tableId) {
    if (currentMode === 'coop' && playerRole === 'joiner' && ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ action: 'ACTION_CLEAN', target: 'table', id: tableId }));
    }
}

// -- AI Bot Controllers (V12) --
let opponentBotScore = 0;
function simulateOpponentScore() {
    // Increment score randomly between $5 - $20 base, scaled by Day level.
    let baseMin = 5 * gameState.day;
    let baseMax = 20 * gameState.day;
    let increment = Math.floor(Math.random() * (baseMax - baseMin + 1)) + baseMin;
    opponentBotScore += increment;
    
    // Animate and update DOM
    els.opponentMoney.textContent = opponentBotScore;
}

function simulateBusserActions() {
    // Scan slots for dirty cups 
    for(let i=0; i<gameState.slots; i++) {
        if(slotStates[i] && slotStates[i].status === 'dirty') {
            slotStates[i].status = 'empty';
            updateSlotUI(i);
        }
    }
    // Scan tables for dirty cups
    for(let i=0; i<4; i++) {
        if(tableStates[i] && tableStates[i].status === 'dirty') {
            tableStates[i].status = 'empty';
            updateDiningTables();
        }
    }
}

// -- Quest Logic --
function generateDailyQuest() {
    const types = ['customers', 'items', 'revenue', 'tips'];
    let chosen = types[Math.floor(Math.random() * types.length)];
    let q = { type: chosen, current: 0, completed: false };
    
    let scaler = Math.min(5, Math.floor(gameState.day / 2) + 1);
    
    if (chosen === 'customers') {
        q.target = 3 + scaler * 2;
        q.desc = `Serve ${q.target} Customers`;
        q.reward = 10 + scaler * 5;
    } else if (chosen === 'items') {
        q.target = 5 + scaler * 3;
        q.desc = `Prepare ${q.target} Items`;
        q.reward = 15 + scaler * 5;
    } else if (chosen === 'revenue') {
        q.target = 30 + scaler * 20;
        q.desc = `Earn $${q.target} Daily Revenue`;
        q.reward = 20 + scaler * 10;
    } else if (chosen === 'tips') {
        q.target = 2 + scaler;
        q.desc = `Get ${q.target} Fast Tips`;
        q.reward = 15 + scaler * 5;
    }
    
    gameState.activeQuest = q;
    updateHUD();
}

function progressQuest(type, amount) {
    let q = gameState.activeQuest;
    if (q && !q.completed && q.type === type) {
        q.current += amount;
        if (q.current >= q.target) {
            q.current = q.target;
            q.completed = true;
            gameState.money += q.reward;
            showFloatingText(`Quest Done! +$${q.reward}`, els.timeVal);
        }
        updateHUD();
    }
}


// -- Upgrades --
if(els.upgradesBtn) els.upgradesBtn.addEventListener('click', () => els.upgradesModal.classList.remove('hidden'));
if(els.closeModalBtn) els.closeModalBtn.addEventListener('click', () => els.upgradesModal.classList.add('hidden'));

if(els.buySlotBtn) els.buySlotBtn.addEventListener('click', () => {
    if (gameState.money >= costs.slot && gameState.slots < gameState.maxSlots) {
        gameState.money -= costs.slot;
        gameState.slots++;
        costs.slot = Math.floor(costs.slot * 1.5);
        renderSlots();
        updateHUD();
        let t = document.getElementById('table-count-view');
        if (t) t.textContent = gameState.slots;
    }
});

if(els.buySpeedBtn) els.buySpeedBtn.addEventListener('click', () => {
    if(gameState.money >= costs.speed) {
        gameState.money -= costs.speed;
        gameState.speedMultiplier += 0.2;
        costs.speed = Math.floor(costs.speed * 1.4);
        updateHUD();
    }
});

if(els.buyTrayBtn) els.buyTrayBtn.addEventListener('click', () => {
    if(gameState.money >= costs.tray && gameState.maxTray < 6) {
        gameState.money -= costs.tray;
        gameState.maxTray++;
        costs.tray = Math.floor(costs.tray * 1.6);
        renderTray();
        updateHUD();
    }
});

if (els.leaderboardBtn && els.leaderboardModal) {
    els.leaderboardBtn.addEventListener('click', () => {
        renderLeaderboard();
        els.leaderboardModal.classList.remove('hidden');
    });
    els.closeLbBtn.addEventListener('click', () => {
        els.leaderboardModal.classList.add('hidden');
    });
}

function showFloatingText(text, parentElement, isAngry = false) {
    let el = document.createElement('div');
    el.className = 'floating-text ' + (isAngry ? 'angry' : '');
    el.textContent = text;
    let rect = parentElement.getBoundingClientRect();
    el.style.left = (rect.left + Math.random() * 50) + 'px';
    el.style.top = (rect.top + 20) + 'px';
    els.notifications.appendChild(el);
    setTimeout(() => el.remove(), 1500);
}

// --- Multiplayer / Lobby Logic ---
let ws = null;
let botTimeout = null;
let botCountdown = null;
let botTimeLeft = 30;
let currentMode = 'single';
let playerRole = 'host';

// Floating popup DOM refs
const mpEls = {
    toggleQuest: document.getElementById('toggle-quest'),
    toggleRank: document.getElementById('toggle-rank'),
    toggleMultiplayer: document.getElementById('toggle-multiplayer'),
    questPopup: document.getElementById('quest-popup'),
    rankPopup: document.getElementById('rank-popup'),
    mpPopup: document.getElementById('mp-popup'),
    rankBadge: document.getElementById('rank-badge'),
    rankTitle: document.getElementById('rank-title'),
    rankEarnings: document.getElementById('rank-earnings'),
    rankLeaderboard: document.getElementById('rank-leaderboard'),
    btnPvp: document.getElementById('btn-pvp'),
    btnCoop: document.getElementById('btn-coop'),
    mpButtons: document.getElementById('mp-buttons'),
    mpStatus: document.getElementById('mp-status'),
    matchStatusText: document.getElementById('match-status-text'),
    matchCodeDisplay: document.getElementById('match-code-display'),
    codeTextVal: document.getElementById('code-text-val'),
    roomCodeInput: document.getElementById('room-code-input'),
    btnJoin: document.getElementById('btn-join-room'),
    btnCancel: document.getElementById('btn-cancel-match'),
};

// Ranking Tiers
const RANK_TIERS = [
    { name: 'Beginner', icon: '🌱', min: 0 },
    { name: 'Apprentice', icon: '⭐', min: 500 },
    { name: 'Expert', icon: '💎', min: 1000 },
    { name: 'Master', icon: '👑', min: 2500 },
    { name: 'Legend', icon: '🔥', min: 5000 },
];

function getTier(score) {
    let tier = RANK_TIERS[0];
    for (let t of RANK_TIERS) {
        if (score >= t.min) tier = t;
    }
    return tier;
}

function closeAllPopups() {
    mpEls.questPopup.classList.add('hidden');
    mpEls.rankPopup.classList.add('hidden');
    mpEls.mpPopup.classList.add('hidden');
    mpEls.toggleQuest.classList.remove('active');
    mpEls.toggleRank.classList.remove('active');
    mpEls.toggleMultiplayer.classList.remove('active');
}

function updateRankDisplay() {
    // Update my own tier
    let total = gameState.totalEarnings;
    let myTier = getTier(total);
    mpEls.rankBadge.textContent = myTier.icon;
    mpEls.rankTitle.textContent = myTier.name;
    mpEls.rankEarnings.textContent = `($${total})`;
    
    // Fetch global leaderboard
    fetch('/api/leaderboard', {
        headers: { 'ngrok-skip-browser-warning': 'true' }
    })
        .then(r => r.json())
        .then(data => {
            if (!data || data.length === 0) {
                mpEls.rankLeaderboard.innerHTML = '<p style="text-align:center; color:#9ca3af; font-size:0.8rem;">No scores yet!</p>';
                return;
            }
            let html = '';
            data.forEach((entry, i) => {
                let tier = getTier(entry.score);
                let isMe = entry.name === gameState.playerName;
                html += `<div class="rank-tier-row ${isMe ? 'active' : ''}" style="margin-bottom:3px;">
                    <span style="width:18px; text-align:center; font-size:0.75rem; color:#9ca3af;">${i+1}</span>
                    <span style="font-size:0.85rem;">${tier.icon}</span>
                    <span style="flex:1; font-size:0.8rem; font-weight:${isMe ? '800' : '600'}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${entry.name}</span>
                    <span style="font-size:0.75rem; color:#10b981; font-weight:700;">$${entry.score}</span>
                </div>`;
            });
            mpEls.rankLeaderboard.innerHTML = html;
        })
        .catch(() => {
            mpEls.rankLeaderboard.innerHTML = '<p style="text-align:center; color:#ef4444; font-size:0.8rem;">Offline</p>';
        });
}

function submitScore() {
    let name = encodeURIComponent(gameState.playerName);
    let score = gameState.totalEarnings;
    fetch(`/api/submit_score?name=${name}&score=${score}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
    }).catch(() => {});
}

// Toggle popups
mpEls.toggleQuest.addEventListener('click', () => {
    let isOpen = !mpEls.questPopup.classList.contains('hidden');
    closeAllPopups();
    if (!isOpen) { mpEls.questPopup.classList.remove('hidden'); mpEls.toggleQuest.classList.add('active'); }
});

mpEls.toggleRank.addEventListener('click', () => {
    let isOpen = !mpEls.rankPopup.classList.contains('hidden');
    closeAllPopups();
    if (!isOpen) { mpEls.rankPopup.classList.remove('hidden'); mpEls.toggleRank.classList.add('active'); updateRankDisplay(); }
});

mpEls.toggleMultiplayer.addEventListener('click', () => {
    let isOpen = !mpEls.mpPopup.classList.contains('hidden');
    closeAllPopups();
    if (!isOpen) { mpEls.mpPopup.classList.remove('hidden'); mpEls.toggleMultiplayer.classList.add('active'); }
});

function connectWS(mode) {
    if(ws) ws.close();
    
    let wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${wsProtocol}//${location.host}`);
    
    ws.onopen = () => {
        if (mode) {
            mpEls.matchStatusText.textContent = "Connected. Creating Room...";
            ws.send(JSON.stringify({ action: 'CREATE_ROOM', mode: mode }));
        } else {
            console.log("WebSocket connected for background services.");
            // If already had local storage login, try to "re-login" or just wait
        }
    };
    
    ws.onmessage = (e) => {
        let msg = JSON.parse(e.data);
        if (msg.type === 'ROOM_CREATED') {
            mpEls.matchCodeDisplay.classList.remove('hidden');
            mpEls.codeTextVal.textContent = msg.code;
            
            // Bot Matchmaker Timer
            botTimeLeft = 30;
            mpEls.matchStatusText.textContent = `Searching... (${botTimeLeft}s)`;
            
            botCountdown = setInterval(() => {
                botTimeLeft--;
                if (botTimeLeft > 0) {
                    mpEls.matchStatusText.textContent = `Searching... (${botTimeLeft}s)`;
                }
            }, 1000);
            
            botTimeout = setTimeout(() => {
                clearInterval(botCountdown);
                mpEls.matchStatusText.textContent = "Starting with Bot...";
                currentMode = currentMode === 'pvp' ? 'pvp_bot' : 'coop_bot';
                if(ws) ws.close();
                softRebootForMultiplayer();
            }, 30000);
            
        } else if (msg.type === 'ROOM_JOINED') {
            mpEls.matchStatusText.textContent = "Joined Room!";
            mpEls.matchCodeDisplay.classList.remove('hidden');
            mpEls.codeTextVal.textContent = msg.code;
            if(msg.mode) currentMode = msg.mode;
        } else if (msg.type === 'PLAYER_JOINED') {
            if (botTimeout) {
                clearTimeout(botTimeout);
                clearInterval(botCountdown);
            }
            mpEls.matchStatusText.textContent = "Player joined! Starting...";
            // Auto-ready when player joins
            if(ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ action: 'TOGGLE_READY' }));
            }
        } else if (msg.type === 'READY_STATUS') {
            // ignore, auto-handling
        } else if (msg.type === 'GAME_START') {
            if(msg.role) playerRole = msg.role;
            softRebootForMultiplayer();
        } else if (msg.type === 'OPPONENT_SCORE') {
            els.opponentMoney.textContent = msg.score;
        } else if (msg.type === 'REGISTER_SUCCESS') {
            showNotification("Account created! You can now login.", 'success');
            els.btnLogin.click(); // Switch view if needed
        } else if (msg.type === 'LOGIN_SUCCESS') {
            localStorage.setItem('isLoggedIn', 'true');
            gameState.playerName = msg.username;
            showNotification(`Welcome back, ${msg.username}!`, 'success');
            els.authModal.classList.add('hidden');
            els.authBtn.innerHTML = `<i class="fa-solid fa-user-check"></i> ${msg.username}`;
            if (msg.progress) {
                Object.assign(gameState, msg.progress);
                buildMenuUI();
                updateAppliances();
                updateHUD();
                renderSlots();
                renderTray();
            }
        } else if (msg.type === 'SAVE_SUCCESS') {
            showNotification("Progress saved to cloud!", 'success');
        } else if (msg.type === 'ERROR') {
            if (els.authError) els.authError.textContent = msg.msg;
            showNotification(msg.msg, 'error');
        } else if (msg.type === 'SYNC_EVENT' && playerRole === 'joiner') {
            gameState = msg.eventData.gameState;
            slotStates = msg.eventData.slotStates;
            tableStates = msg.eventData.tableStates;
            
            if(els.moneyAmount) els.moneyAmount.textContent = gameState.money;
            if(els.slotCountView) els.slotCountView.textContent = gameState.slots;
            if(els.dayCount) els.dayCount.textContent = gameState.day;
            if(els.timeVal) els.timeVal.textContent = formatTime(gameState.timeMinutes);
            els.trayCount.textContent = gameState.tray.length;
            els.trayMax.textContent = gameState.maxTray;
            
            if (gameState.activeQuest) {
                let q = gameState.activeQuest;
                els.questDesc.textContent = q.desc;
                els.questText.textContent = `${q.current}/${q.target}`;
                els.questBarFill.style.width = `${Math.min(100, (q.current / q.target) * 100)}%`;
                if (q.completed) els.questBarFill.style.background = '#3b82f6';
                else els.questBarFill.style.background = '#10b981';
            }
            renderSlots();
            renderTray();
            updateDiningTables();
        } else if (msg.type === 'ACTION_CLEAN' && playerRole === 'host') {
            if (msg.target === 'slot') {
                slotStates[msg.id].status = 'empty';
                updateSlotUI(msg.id);
            } else if (msg.target === 'table') {
                tableStates[msg.id].status = 'empty';
                updateDiningTables();
            }
            syncCoopState();
        } else if (msg.type === 'ERROR') {
            alert(msg.msg);
        }
    };
    
    ws.onerror = () => {
        mpEls.matchStatusText.textContent = "Connection Failed.";
        mpEls.matchStatusText.style.color = "#ef4444";
    };
}

// Soft reboot: reset game state for multiplayer without reloading
function softRebootForMultiplayer() {
    // Close popups
    mpEls.mpPopup.classList.add('hidden');
    mpEls.toggleMultiplayer.classList.remove('active');
    
    // Toggle PvP HUD
    if(currentMode === 'pvp' || currentMode === 'pvp_bot') {
        els.opponentHud.classList.remove('hidden');
    }
    
    // Reset game state for fresh multiplayer round
    gameState.money = 10;
    gameState.day = 1;
    gameState.timeMinutes = 540;
    gameState.isDayActive = true;
    gameState.dayStats = { revenue: 0, cogs: 0, tips: 0 };
    gameState.tray = [];
    opponentBotScore = 0;
    
    // Reset slots
    for(let i = 0; i < 4; i++) { slotStates[i] = { status: 'empty' }; }
    for(let i = 0; i < 4; i++) { tableStates[i] = { status: 'empty' }; }
    
    generateDailyQuest();
    updateHUD();
    renderSlots();
    renderTray();
    updateDiningTables();
    
    // Start bots if needed
    if (currentMode === 'pvp_bot') {
        setInterval(simulateOpponentScore, 5000);
    } else if (currentMode === 'coop_bot') {
        setInterval(simulateBusserActions, 2000);
    }
    
    showFloatingText("🎮 Multiplayer Started!", els.timeVal);
}

// PvP button
mpEls.btnPvp.addEventListener('click', () => {
    currentMode = 'pvp';
    mpEls.mpButtons.classList.add('hidden');
    mpEls.mpStatus.classList.remove('hidden');
    connectWS('pvp');
});

// Co-op button
mpEls.btnCoop.addEventListener('click', () => {
    currentMode = 'coop';
    mpEls.mpButtons.classList.add('hidden');
    mpEls.mpStatus.classList.remove('hidden');
    connectWS('coop');
});

// Join room
mpEls.btnJoin.addEventListener('click', () => {
    let code = mpEls.roomCodeInput.value.trim();
    if(code && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'JOIN_ROOM', code: code }));
    } else if (code) {
        let wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(`${wsProtocol}//${location.host}`);
        ws.onopen = () => {
            ws.send(JSON.stringify({ action: 'JOIN_ROOM', code: code }));
        };
        // Reuse same onmessage handler
        ws.onmessage = (e) => {
            let msg = JSON.parse(e.data);
            if (msg.type === 'ROOM_JOINED') {
                if(msg.mode) currentMode = msg.mode;
                mpEls.matchStatusText.textContent = "Joined! Waiting for start...";
                // Auto-ready
                if(ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ action: 'TOGGLE_READY' }));
                }
            } else if (msg.type === 'GAME_START') {
                if(msg.role) playerRole = msg.role;
                softRebootForMultiplayer();
            } else if (msg.type === 'OPPONENT_SCORE') {
                els.opponentMoney.textContent = msg.score;
            } else if (msg.type === 'SYNC_EVENT' && playerRole === 'joiner') {
                gameState = msg.eventData.gameState;
                slotStates = msg.eventData.slotStates;
                tableStates = msg.eventData.tableStates;
                if(els.moneyAmount) els.moneyAmount.textContent = gameState.money;
                if(els.dayCount) els.dayCount.textContent = gameState.day;
                if(els.timeVal) els.timeVal.textContent = formatTime(gameState.timeMinutes);
                renderSlots(); renderTray(); updateDiningTables();
            } else if (msg.type === 'ACTION_CLEAN' && playerRole === 'host') {
                if (msg.target === 'slot') { slotStates[msg.id].status = 'empty'; updateSlotUI(msg.id); }
                else if (msg.target === 'table') { tableStates[msg.id].status = 'empty'; updateDiningTables(); }
                syncCoopState();
            } else if (msg.type === 'ERROR') {
                alert(msg.msg);
            }
        };
    }
});

// Cancel matchmaking
mpEls.btnCancel.addEventListener('click', () => {
    if(ws) ws.close();
    if(botTimeout) { clearTimeout(botTimeout); clearInterval(botCountdown); }
    currentMode = 'single';
    mpEls.mpStatus.classList.add('hidden');
    mpEls.mpButtons.classList.remove('hidden');
    mpEls.matchCodeDisplay.classList.add('hidden');
    mpEls.matchStatusText.textContent = "Searching... (30s)";
    mpEls.matchStatusText.style.color = "#10b981";
});

// Auto-start single-player on page load!
initGame();


// --- V19 Logic: Shop, Auth & Multi-order ---

function showNotification(msg, type='info') {
    const n = document.createElement('div');
    n.className = `notification ${type}`;
    n.textContent = msg;
    els.notifications.appendChild(n);
    setTimeout(() => n.classList.add('hide'), 2500);
    setTimeout(() => n.remove(), 3000);
}

function setupEventListeners() {
    if (els.buyTrayBtn) els.buyTrayBtn.addEventListener('click', buyTraySlot);
    if (els.buyEquipmentBtn) els.buyEquipmentBtn.addEventListener('click', buyEquipment);
    
    // Auth listeners
    if (els.authBtn) {
        els.authBtn.addEventListener('click', () => {
            els.authModal.classList.remove('hidden');
            els.authError.textContent = '';
        });
    }
    if (els.closeAuthBtn) els.closeAuthBtn.addEventListener('click', () => els.authModal.classList.add('hidden'));
    
    if (els.btnRegister) els.btnRegister.addEventListener('click', () => authAction('REGISTER'));
    if (els.btnLogin) els.btnLogin.addEventListener('click', () => authAction('LOGIN'));

    // Upgrades Modal
    if (els.upgradesBtn) {
        els.upgradesBtn.addEventListener('click', () => {
            els.upgradesModal.classList.remove('hidden');
            updateHUD();
        });
    }
    if (els.closeModalBtn) els.closeModalBtn.addEventListener('click', () => els.upgradesModal.classList.add('hidden'));

    // Table Upgrades
    if (els.buySlotBtn) {
        els.buySlotBtn.addEventListener('click', () => {
            if (gameState.money >= costs.slot && gameState.slots < gameState.maxSlots) {
                gameState.money -= costs.slot;
                gameState.slots++;
                costs.slot = Math.floor(costs.slot * 1.5);
                renderSlots();
                updateHUD();
                showNotification("Expanded counter space!", "success");
            }
        });
    }
}

function buyTraySlot() {
    if (gameState.money >= gameState.trayPrice && gameState.maxTray < 10) {
        gameState.money -= gameState.trayPrice;
        gameState.maxTray++;
        gameState.boughtTrayCount++;
        gameState.trayPrice = 200 + (gameState.boughtTrayCount * 150);
        showNotification(`Expanded Tray to ${gameState.maxTray}!`, 'success');
        updateHUD();
        renderTray();
    }
}

function buyEquipment() {
    const cats = Object.keys(MENU_CATEGORIES);
    if (gameState.money >= gameState.equipmentPrice && gameState.unlockedCategoryIndex < cats.length - 1) {
        gameState.money -= gameState.equipmentPrice;
        gameState.unlockedCategoryIndex++;
        
        const newCat = cats[gameState.unlockedCategoryIndex];
        gameState.unlockedCategories.push(newCat);
        
        // Unlock items in that category
        for (const [itemKey, itemData] of Object.entries(MENU)) {
            if (itemData.cat === newCat) {
                gameState.unlockedItems.push(itemKey);
            }
        }
        
        gameState.boughtEquipmentCount = (gameState.boughtEquipmentCount || 0) + 1;
        gameState.equipmentPrice = 200 + (gameState.boughtEquipmentCount * 200);
        
        showNotification(`Unlocked ${MENU_CATEGORIES[newCat].name}!`, 'success');
        buildMenuUI();
        updateAppliances();
        updateHUD();
    }
}

// --- Auth Logic ---
function authAction(type) {
    const username = els.authUsername.value;
    const password = els.authPass.value;
    if (!username || !password) {
        els.authError.textContent = "Please enter both username and password.";
        return;
    }
    
    if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({
            action: type,
            username: username,
            password: password
        }));
    } else {
        els.authError.textContent = "Server offline. Try again later.";
    }
}


function saveGameToServer() {
    if (ws && ws.readyState === 1 && (localStorage.getItem('isLoggedIn') || gameState.isLoggedIn)) {
        ws.send(JSON.stringify({
            action: 'SAVE_PROGRESS',
            progress: gameState
        }));
    }
}
