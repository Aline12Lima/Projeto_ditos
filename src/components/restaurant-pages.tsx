"use client";

import { useEffect, useState } from "react";

const categories = ["Pizza", "Porções", "Hambúrgueres", "Bebidas", "Sobremesas"] as const;
type Category = (typeof categories)[number];
type Dish = { id: string; name: string; description: string; price: string; emoji: string; category: Category };
type CartItem = { dishId: string; quantity: number };
type TableStatus = "LIVRE" | "OCUPADA" | "PEDIDO_RECEBIDO" | "EM_PREPARO" | "ENTREGUE" | "AGUARDANDO_PAGAMENTO" | "PAGO";
type Order = { id: number; table: number; items: { name: string; price: string; quantity: number }[]; total: number; status: TableStatus; createdAt: string; notes?: string };
const menuStorageKey = "ditus-menu-items";
const cartStorageKey = "ditus-cart-items";
const ordersStorageKey = "ditus-orders";
const tableStorageKey = "ditus-table";
const initialDishes: Dish[] = [
  { id: "pizza-margherita", name: "Pizza Margherita", description: "Molho de tomate, muçarela, tomate fresco e manjericão.", price: "R$ 42,00", emoji: "🍕", category: "Pizza" },
  { id: "pizza-pepperoni", name: "Pizza Pepperoni", description: "Molho de tomate, muçarela e pepperoni fatiado.", price: "R$ 48,00", emoji: "🍕", category: "Pizza" },
  { id: "fries", name: "Batata frita", description: "Porção crocante com molho da casa.", price: "R$ 18,90", emoji: "🍟", category: "Porções" },
  { id: "onion-rings", name: "Anéis de cebola", description: "Porção empanada, sequinha e crocante.", price: "R$ 21,90", emoji: "🧅", category: "Porções" },
  { id: "burger", name: "Hambúrguer Clássico", description: "Pão brioche, hambúrguer, queijo e molho especial.", price: "R$ 32,90", emoji: "🍔", category: "Hambúrgueres" },
  { id: "soda", name: "Refrigerante lata", description: "Coca-Cola, Guaraná ou Coca-Cola Zero.", price: "R$ 8,00", emoji: "🥤", category: "Bebidas" },
  { id: "brownie", name: "Brownie com sorvete", description: "Brownie de chocolate servido com sorvete de baunilha.", price: "R$ 19,90", emoji: "🍨", category: "Sobremesas" },
];

function categoryForItem(item: Partial<Dish>): Category {
  if (item.category && categories.includes(item.category)) return item.category;
  if (item.id === "pizza") return "Pizza";
  if (item.id === "fries") return "Porções";
  return "Hambúrgueres";
}

function useMenuItems() {
  const [items, setItems] = useState<Dish[]>(initialDishes);
  useEffect(() => {
    const savedItems = window.localStorage.getItem(menuStorageKey);
    if (savedItems) {
      const parsedItems = JSON.parse(savedItems) as Partial<Dish>[];
      setItems(parsedItems.map((item) => ({ ...item, category: categoryForItem(item) })) as Dish[]);
    }
  }, []);
  function save(nextItems: Dish[]) { window.localStorage.setItem(menuStorageKey, JSON.stringify(nextItems)); setItems(nextItems); }
  return { items, save };
}

function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  useEffect(() => {
    const savedCart = window.localStorage.getItem(cartStorageKey);
    if (savedCart) setCart(JSON.parse(savedCart) as CartItem[]);
  }, []);
  function save(nextCart: CartItem[]) { window.localStorage.setItem(cartStorageKey, JSON.stringify(nextCart)); setCart(nextCart); }
  function add(dishId: string) { const item = cart.find((cartItem) => cartItem.dishId === dishId); save(item ? cart.map((cartItem) => cartItem.dishId === dishId ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem) : [...cart, { dishId, quantity: 1 }]); }
  function change(dishId: string, quantity: number) { save(quantity <= 0 ? cart.filter((item) => item.dishId !== dishId) : cart.map((item) => item.dishId === dishId ? { ...item, quantity } : item)); }
  return { cart, add, change, clear: () => save([]), totalItems: cart.reduce((total, item) => total + item.quantity, 0) };
}

function toNumber(price: string) { return Number(price.replace("R$", "").replace(".", "").replace(",", ".").trim()); }
function formatPrice(value: number) { return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function getOrders(): Order[] { try { return JSON.parse(window.localStorage.getItem(ordersStorageKey) ?? "[]") as Order[]; } catch { return []; } }
function statusLabel(status: TableStatus) { return ({ LIVRE: "Livre", OCUPADA: "Ocupada", PEDIDO_RECEBIDO: "Pedido recebido", EM_PREPARO: "Em preparo", ENTREGUE: "Entregue", AGUARDANDO_PAGAMENTO: "Aguardando pagamento", PAGO: "Pago" })[status]; }

function Mark() { return <span className="mark"><b>◆</b> Ditos</span>; }
function Logo() { return <span className="brand"><i />Ditos</span>; }
function Shell({ children }: { children: React.ReactNode }) { return <main className="app-shell"><div className="app-page">{children}</div></main>; }
function Back({ href }: { href: string }) { return <a href={href} className="back" aria-label="Voltar">‹</a>; }
function CartBar({ href = "/cliente/carrinho", total = "" }: { href?: string; total?: string }) { return <a className="cart-bar" href={href}><span>🛒</span><span>Ver carrinho</span><b>{total}</b></a>; }

export function EmployeeStart() { return <Shell><section className="employee-start"><Mark /><div><div className="logo-card"><Logo /></div><h1>Bem-vindo à<br />Ditos</h1><p>Gestão simples, atendimento melhor.</p></div><a className="solid-button" href="/funcionario/login">Acessar painel</a></section></Shell>; }

export function Login() { return <Shell><header className="simple-header"><Back href="/" /><Mark /></header><section className="login"><div className="avatar">👤</div><h1>Painel Administrativo</h1><p>Entre para gerenciar seu restaurante.</p><label>E-mail<input placeholder="seu@email.com" type="email" /></label><label>Senha<input placeholder="••••••••" type="password" /></label><a className="forgot" href="#">Esqueci minha senha</a><a className="solid-button" href="/funcionario/painel">Entrar</a><p className="help">Ainda não tem acesso? <a href="#">Fale conosco</a></p></section></Shell>; }

export function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]); const [selectedTable, setSelectedTable] = useState<number | null>(null);
  useEffect(() => setOrders(getOrders()), []);
  const today = orders.reduce((sum, order) => sum + order.total, 0); const active = orders.filter((order) => !["PAGO", "LIVRE"].includes(order.status));
  function tableStatus(table: number): TableStatus { return [...orders].reverse().find((order) => order.table === table)?.status ?? "LIVRE"; }
  const selectedOrder = selectedTable ? [...orders].reverse().find((order) => order.table === selectedTable && order.status !== "PAGO") : undefined;
  return <Shell><header className="dash-header"><div><Logo /><p>Painel administrativo</p></div><a href="/">↪</a></header><section className="dashboard"><h1>Visão geral</h1><div className="stats admin-stats"><article><span>Faturamento hoje</span><b>{formatPrice(today)}</b><small>{orders.length} pedidos</small></article><article><span>Mesas ocupadas</span><b>{active.length}</b><small>{45 - active.length} livres</small></article><article><span>Em andamento</span><b>{orders.filter((o) => ["PEDIDO_RECEBIDO", "EM_PREPARO"].includes(o.status)).length}</b><small>cozinha</small></article></div><div className="section-title"><h2>Mesas</h2><span className="muted">45 mesas</span></div><div className="table-grid">{Array.from({ length: 45 }, (_, index) => index + 1).map((table) => { const status = tableStatus(table); return <button key={table} className={`table-card status-${status.toLowerCase()}`} onClick={() => setSelectedTable(table)}><b>Mesa {String(table).padStart(2, "0")}</b><small>{statusLabel(status)}</small></button>; })}</div><div className="section-title"><h2>Pedidos recentes</h2></div><div className="order-list">{orders.slice().reverse().slice(0, 5).map((order) => <a href={`/funcionario/pedido/${order.id}`} className="order" key={order.id}><span className="order-icon">▣</span><span><b>#{order.id}</b><small>Mesa {String(order.table).padStart(2, "0")}</small></span><span className="order-price"><b>{formatPrice(order.total)}</b><em>{statusLabel(order.status)}</em></span><span>›</span></a>)}{orders.length === 0 && <p className="empty-menu">Nenhum pedido recebido ainda.</p>}</div></section>{selectedTable && <div className="modal-backdrop product-backdrop" onMouseDown={() => setSelectedTable(null)}><section className="table-modal" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelectedTable(null)}>×</button><p className="product-category">{statusLabel(tableStatus(selectedTable))}</p><h2>Mesa {String(selectedTable).padStart(2, "0")}</h2>{selectedOrder ? <><p>Pedido #{selectedOrder.id}</p>{selectedOrder.items.map((item) => <div className="table-item" key={item.name}><span>{item.quantity} × {item.name}</span><b>{formatPrice(toNumber(item.price) * item.quantity)}</b></div>)}<div className="total"><span>Total</span><b>{formatPrice(selectedOrder.total)}</b></div><a className="solid-button" href={`/funcionario/pedido/${selectedOrder.id}`}>Abrir pedido</a></> : <p className="muted">Esta mesa está livre e não possui pedido ativo.</p>}</section></div>}<nav className="bottom-nav"><a className="active" href="/funcionario/painel">⌂<small>Início</small></a><a>▤<small>Pedidos</small></a><a href="/funcionario/cardapio">▦<small>Cardápio</small></a><a>⚙<small>Ajustes</small></a></nav></Shell>;
}

export function OrderDetail({ id }: { id?: string }) { const [order, setOrder] = useState<Order | null>(null); useEffect(() => { const found = getOrders().find((item) => String(item.id) === id) ?? getOrders().at(-1) ?? null; setOrder(found); }, [id]); function advance(status: TableStatus, print = false) { if (!order) return; const updated = { ...order, status }; localStorage.setItem(ordersStorageKey, JSON.stringify(getOrders().map((item) => item.id === order.id ? updated : item))); setOrder(updated); if (print) setTimeout(() => window.print(), 50); } if (!order) return <Shell><header className="simple-header"><Back href="/funcionario/painel" /><h1>Detalhes do pedido</h1></header><div className="order-sent"><span>!</span><h2>Pedido não encontrado</h2></div></Shell>; const action = order.status === "PEDIDO_RECEBIDO" ? <button className="solid-button" onClick={() => advance("EM_PREPARO", true)}>Enviar para cozinha e imprimir</button> : order.status === "EM_PREPARO" ? <button className="solid-button" onClick={() => advance("ENTREGUE")}>Pedido entregue</button> : order.status === "ENTREGUE" ? <button className="solid-button" onClick={() => advance("AGUARDANDO_PAGAMENTO")}>Solicitar pagamento</button> : order.status === "AGUARDANDO_PAGAMENTO" ? <button className="solid-button" onClick={() => advance("PAGO")}>Pedido pago e liberar mesa</button> : null; return <Shell><header className="simple-header"><Back href="/funcionario/painel" /><h1>Detalhes do pedido</h1></header><section className="detail receipt"><div className="order-top"><div><p>Pedido <b>#{order.id}</b></p><small>{new Date(order.createdAt).toLocaleString("pt-BR")}</small></div><strong>{statusLabel(order.status)}</strong></div><div className="customer"><span>{order.table}</span><div><b>Mesa {String(order.table).padStart(2, "0")}</b><small>Atendimento no salão</small></div></div><h2>Itens do pedido</h2>{order.items.map((item) => <div className="item-line" key={item.name}><span>{item.quantity}x</span><div><b>{item.name}</b></div><b>{formatPrice(toNumber(item.price) * item.quantity)}</b></div>)}{order.notes && <p className="order-notes"><b>Observações:</b> {order.notes}</p>}<div className="total"><span>Total</span><b>{formatPrice(order.total)}</b></div><div className="detail-actions single">{action}</div></section></Shell>; }

export function EmployeeMenu() {
  const { items, save } = useMenuItems();
  const [editing, setEditing] = useState<Dish | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const emptyItem: Dish = { id: "", name: "", description: "", price: "", emoji: "🍽️", category: "Hambúrgueres" };
  const formItem = editing ?? emptyItem;
  function updateField(field: keyof Dish, value: string) { setEditing({ ...formItem, [field]: value }); }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formItem.name.trim() || !formItem.price.trim()) return;
    const nextItem = { ...formItem, id: formItem.id || crypto.randomUUID() };
    save(items.some((item) => item.id === nextItem.id) ? items.map((item) => item.id === nextItem.id ? nextItem : item) : [...items, nextItem]);
    setEditing(null); setIsAdding(false);
  }
  return <Shell><header className="menu-header employee-menu-header"><Back href="/funcionario/painel" /><div><h1>Cardápio</h1><p>Gerencie os itens disponíveis</p></div><button className="round-add" aria-label="Adicionar novo item" onClick={() => { setEditing(emptyItem); setIsAdding(true); }}>+</button></header><section className="employee-menu"><div className="menu-summary"><span>Itens ativos</span><b>{items.length}</b></div>{items.length === 0 && <p className="empty-menu">Nenhum item no cardápio. Use o botão + para adicionar.</p>}{items.map((item) => <article className="admin-dish" key={item.id}><div className="dish-photo">{item.emoji}</div><div><h3>{item.name}</h3><p>{item.description}</p><b>{item.price}</b></div><div className="admin-actions"><button aria-label={`Editar ${item.name}`} onClick={() => { setEditing(item); setIsAdding(false); }}>✎</button><button aria-label={`Remover ${item.name}`} className="remove" onClick={() => save(items.filter((menuItem) => menuItem.id !== item.id))}>⌫</button></div></article>)}</section>{editing && <div className="modal-backdrop"><form className="item-form" onSubmit={submit}><div className="form-title"><h2>{isAdding ? "Novo item" : "Editar item"}</h2><button type="button" onClick={() => { setEditing(null); setIsAdding(false); }}>×</button></div><label>Nome do item<input value={formItem.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Ex.: Hambúrguer artesanal" autoFocus /></label><label>Descrição<textarea value={formItem.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Descreva o item" /></label><div className="form-grid"><label>Preço<input value={formItem.price} onChange={(event) => updateField("price", event.target.value)} placeholder="R$ 00,00" /></label><label>Ícone<input value={formItem.emoji} onChange={(event) => updateField("emoji", event.target.value)} placeholder="🍔" /></label></div><button className="solid-button" type="submit">{isAdding ? "Adicionar item" : "Salvar alterações"}</button></form></div>}<nav className="bottom-nav"><a href="/funcionario/painel">⌂<small>Início</small></a><a>▤<small>Pedidos</small></a><a className="active" href="/funcionario/cardapio">▦<small>Cardápio</small></a><a>⚙<small>Ajustes</small></a></nav></Shell>;
}

export function ClientHome() {
  const [lang, setLang] = useState<"PT" | "ES" | "EN">("PT");
  const copy = {
    PT: { title: <>Bem-vindo ao<br />Restaurante Ditos.</>, description: "Escolha seu idioma e aproveite o sabor que aproxima.", menu: "Iniciar pedido", language: "Escolha o seu idioma", home: "Início", menuNav: "Cardápio", cart: "Carrinho", profile: "Perfil" },
    ES: { title: <>Bienvenido al<br />Restaurante Ditos.</>, description: "Elige tu idioma y disfruta del sabor que une.", menu: "Empezar pedido", language: "Elige tu idioma", home: "Inicio", menuNav: "Menú", cart: "Carrito", profile: "Perfil" },
    EN: { title: <>Welcome to<br />Restaurante Ditos.</>, description: "Choose your language and enjoy flavor that brings us together.", menu: "Start order", language: "Choose your language", home: "Home", menuNav: "Menu", cart: "Cart", profile: "Profile" },
  }[lang];
  return <Shell><header className="client-header"><Logo /><button className="language" onClick={() => setLang(lang === "PT" ? "ES" : lang === "ES" ? "EN" : "PT")}>{lang}⌄</button></header><section className="client-home welcome-home"><div className="hero-photo"><div><Mark /><h1>{copy.title}</h1><p>{copy.description}</p><p className="language-label">{copy.language}</p><div className="language-options"><button className={lang === "PT" ? "selected" : ""} onClick={() => setLang("PT")}>Português</button><button className={lang === "ES" ? "selected" : ""} onClick={() => setLang("ES")}>Español</button><button className={lang === "EN" ? "selected" : ""} onClick={() => setLang("EN")}>English</button></div><a href="/cliente/cardapio">{copy.menu}</a></div></div></section><nav className="bottom-nav client"><a className="active" href="/cliente">⌂<small>{copy.home}</small></a><a href="/cliente/cardapio">▤<small>{copy.menuNav}</small></a><a href="/cliente/carrinho">🛒<small>{copy.cart}</small></a><a>◉<small>{copy.profile}</small></a></nav></Shell>;
}

export function Menu() {
  const { items } = useMenuItems();
  const { cart, add, totalItems } = useCart();
  const [activeCategory, setActiveCategory] = useState<Category | "Todos">("Todos");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const visibleItems = activeCategory === "Todos" ? items : items.filter((item) => item.category === activeCategory);
  const total = cart.reduce((sum, cartItem) => sum + toNumber(items.find((item) => item.id === cartItem.dishId)?.price ?? "R$ 0") * cartItem.quantity, 0);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) { if (event.key === "Escape") setSelectedDish(null); }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return <Shell><header className="menu-header"><Back href="/cliente" /><div><h1>Cardápio</h1><p>Restaurante Ditos</p></div><a href="/cliente/carrinho" className="bag" aria-label={`Ver carrinho, ${totalItems} itens`}>🛒<b>{totalItems}</b></a></header><section className="menu"><div className="chips" aria-label="Categorias do cardápio"><button className={activeCategory === "Todos" ? "selected" : ""} onClick={() => setActiveCategory("Todos")}>Todos</button>{categories.map((category) => <button key={category} className={activeCategory === category ? "selected" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><h2>{activeCategory === "Todos" ? "Mais pedidos" : activeCategory}</h2>{visibleItems.map((item) => <article className="dish" key={item.id} onClick={() => setSelectedDish(item)}><div className="dish-photo">{item.emoji}</div><div><h3>{item.name}</h3><p>{item.description}</p><b>{item.price}</b></div><button aria-label={`Ver detalhes de ${item.name}`} onClick={(event) => { event.stopPropagation(); setSelectedDish(item); }}>+</button></article>)}{visibleItems.length === 0 && <p className="empty-menu">Ainda não há itens nesta categoria.</p>}</section>{totalItems > 0 && <CartBar total={formatPrice(total)} />}{selectedDish && <div className="modal-backdrop product-backdrop" role="presentation" onMouseDown={() => setSelectedDish(null)}><section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Fechar detalhes" onClick={() => setSelectedDish(null)}>×</button><div className="product-photo">{selectedDish.emoji}</div><p className="product-category">{selectedDish.category}</p><h2 id="product-modal-title">{selectedDish.name}</h2><p>{selectedDish.description}</p><strong>{selectedDish.price}</strong><button className="solid-button" onClick={() => { add(selectedDish.id); setSelectedDish(null); }}>Adicionar ao carrinho</button><button className="text-button" onClick={() => setSelectedDish(null)}>Fechar</button></section></div>}</Shell>;
}

export function Cart() {
  const { items } = useMenuItems(); const { cart, change, clear, totalItems } = useCart(); const [sent, setSent] = useState(false); const [notes, setNotes] = useState(""); const [table, setTable] = useState(1);
  const lines = cart.flatMap((cartItem) => { const dish = items.find((item) => item.id === cartItem.dishId); return dish ? [{ dish, quantity: cartItem.quantity }] : []; });
  const total = lines.reduce((sum, line) => sum + toNumber(line.dish.price) * line.quantity, 0);
  useEffect(() => { const saved = Number(localStorage.getItem(tableStorageKey) ?? "1"); setTable(Math.min(45, Math.max(1, saved))); }, []);
  function sendOrder() { if (lines.length === 0) return; const nextOrder: Order = { id: Number(Date.now().toString().slice(-6)), table, items: lines.map(({ dish, quantity }) => ({ name: dish.name, price: dish.price, quantity })), total, status: "PEDIDO_RECEBIDO", createdAt: new Date().toISOString(), notes }; localStorage.setItem(ordersStorageKey, JSON.stringify([...getOrders(), nextOrder])); clear(); setSent(true); }
  return <Shell><header className="menu-header"><Back href="/cliente/cardapio" /><div><h1>Carrinho</h1><p>{totalItems} {totalItems === 1 ? "item" : "itens"}</p></div></header><section className="cart">{sent ? <div className="order-sent"><span>✓</span><h2>Pedido enviado!</h2><p>O Restaurante Ditos recebeu o pedido da mesa {String(table).padStart(2, "0")}.</p><a className="solid-button" href="/cliente/cardapio">Continuar escolhendo</a></div> : lines.length === 0 ? <div className="order-sent"><span>🛒</span><h2>Seu carrinho está vazio</h2><p>Escolha seus itens no cardápio para iniciar um pedido.</p><a className="solid-button" href="/cliente/cardapio">Ver cardápio</a></div> : <><div className="table-selector"><label>Mesa<select value={table} onChange={(e) => { const value = Number(e.target.value); setTable(value); localStorage.setItem(tableStorageKey, String(value)); }}>{Array.from({length: 45}, (_, i) => <option key={i + 1} value={i + 1}>Mesa {String(i + 1).padStart(2, "0")}</option>)}</select></label></div><h2>Seu pedido</h2>{lines.map(({ dish, quantity }) => <article className="cart-item" key={dish.id}><span className="dish-photo mini">{dish.emoji}</span><div><h3>{dish.name}</h3><b>{dish.price}</b></div><div className="quantity"><button aria-label={`Remover uma unidade de ${dish.name}`} onClick={() => change(dish.id, quantity - 1)}>−</button><span>{quantity}</span><button aria-label={`Adicionar uma unidade de ${dish.name}`} onClick={() => change(dish.id, quantity + 1)}>+</button></div></article>)}<h2>Observações</h2><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Alguma observação para o pedido?" /><div className="cart-total"><span>Total</span><b>{formatPrice(total)}</b></div></>}</section>{!sent && lines.length > 0 && <button className="checkout" onClick={sendOrder}>Enviar pedido <b>{formatPrice(total)}</b></button>}</Shell>;
}
