"use client";

import { useEffect, useState } from "react";

type Dish = { id: string; name: string; description: string; price: string; emoji: string };
type CartItem = { dishId: string; quantity: number };
const menuStorageKey = "ditus-menu-items";
const cartStorageKey = "ditus-cart-items";
const initialDishes: Dish[] = [
  { id: "burger", name: "Hambúrguer Clássico", description: "Pão brioche, hambúrguer, queijo e molho especial", price: "R$ 32,90", emoji: "🍔" },
  { id: "pizza", name: "Pizza Margherita", description: "Molho de tomate, muçarela e manjericão", price: "R$ 49,90", emoji: "🍕" },
  { id: "fries", name: "Batata frita", description: "Porção crocante com molho da casa", price: "R$ 18,90", emoji: "🍟" },
];

function useMenuItems() {
  const [items, setItems] = useState<Dish[]>(initialDishes);
  useEffect(() => {
    const savedItems = window.localStorage.getItem(menuStorageKey);
    if (savedItems) setItems(JSON.parse(savedItems) as Dish[]);
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

function Mark() { return <span className="mark"><b>◆</b> Ditos</span>; }
function Logo() { return <span className="brand"><i />Ditos</span>; }
function Shell({ children }: { children: React.ReactNode }) { return <main className="app-shell"><div className="app-page">{children}</div></main>; }
function Back({ href }: { href: string }) { return <a href={href} className="back" aria-label="Voltar">‹</a>; }
function CartBar({ href = "/cliente/carrinho", total = "" }: { href?: string; total?: string }) { return <a className="cart-bar" href={href}><span>🛒</span><span>Ver carrinho</span><b>{total}</b></a>; }

export function EmployeeStart() { return <Shell><section className="employee-start"><Mark /><div><div className="logo-card"><Logo /></div><h1>Bem-vindo à<br />Ditos</h1><p>Gestão simples, atendimento melhor.</p></div><a className="solid-button" href="/funcionario/login">Acessar painel</a></section></Shell>; }

export function Login() { return <Shell><header className="simple-header"><Back href="/" /><Mark /></header><section className="login"><div className="avatar">👤</div><h1>Painel Administrativo</h1><p>Entre para gerenciar seu restaurante.</p><label>E-mail<input placeholder="seu@email.com" type="email" /></label><label>Senha<input placeholder="••••••••" type="password" /></label><a className="forgot" href="#">Esqueci minha senha</a><a className="solid-button" href="/funcionario/painel">Entrar</a><p className="help">Ainda não tem acesso? <a href="#">Fale conosco</a></p></section></Shell>; }

export function Dashboard() { const orders = [["#1028", "Maria Silva", "R$ 68,70", "Novo"], ["#1027", "João Oliveira", "R$ 42,90", "Em preparo"], ["#1026", "Ana Costa", "R$ 55,40", "Pronto"]]; return <Shell><header className="dash-header"><div><Logo /><p>Olá, Restaurante Ditos</p></div><a href="/">↪</a></header><section className="dashboard"><h1>Resumo de hoje</h1><div className="stats"><article><span>Pedidos</span><b>24</b><small>↑ 12% vs. ontem</small></article><article><span>Faturamento</span><b>R$ 1.248</b><small>↑ 8% vs. ontem</small></article></div><div className="section-title"><h2>Pedidos recentes</h2><a href="#">Ver todos</a></div><div className="order-list">{orders.map(([number, name, price, status]) => <a href="/funcionario/pedido/1028" className="order" key={number}><span className="order-icon">▣</span><span><b>{number}</b><small>{name}</small></span><span className="order-price"><b>{price}</b><em>{status}</em></span><span>›</span></a>)}</div></section><nav className="bottom-nav"><a className="active" href="/funcionario/painel">⌂<small>Início</small></a><a>▤<small>Pedidos</small></a><a href="/funcionario/cardapio">▦<small>Cardápio</small></a><a>⚙<small>Ajustes</small></a></nav></Shell>; }

export function OrderDetail() { return <Shell><header className="simple-header"><Back href="/funcionario/painel" /><h1>Detalhes do pedido</h1><button>•••</button></header><section className="detail"><div className="order-top"><div><p>Pedido <b>#1028</b></p><small>Hoje, 12:42</small></div><strong>Novo</strong></div><div className="customer"><span>MS</span><div><b>Maria Silva</b><small>📞 (11) 99999-9999</small></div><a href="#">›</a></div><h2>Itens do pedido</h2><div className="item-line"><span>1x</span><div><b>Hambúrguer Clássico</b><small>Sem cebola, molho extra</small></div><b>R$ 32,90</b></div><div className="item-line"><span>1x</span><div><b>Batata frita</b><small>Porção grande</small></div><b>R$ 18,90</b></div><div className="item-line"><span>1x</span><div><b>Refrigerante</b><small>Coca-Cola lata</small></div><b>R$ 8,00</b></div><div className="total"><span>Total</span><b>R$ 68,70</b></div><div className="detail-actions"><button className="outline-button">Recusar</button><button className="solid-button">Aceitar pedido</button></div></section></Shell>; }

export function EmployeeMenu() {
  const { items, save } = useMenuItems();
  const [editing, setEditing] = useState<Dish | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const emptyItem: Dish = { id: "", name: "", description: "", price: "", emoji: "🍽️" };
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

export function Menu() { const { items } = useMenuItems(); const { cart, add, totalItems } = useCart(); const total = cart.reduce((sum, cartItem) => sum + toNumber(items.find((item) => item.id === cartItem.dishId)?.price ?? "R$ 0") * cartItem.quantity, 0); return <Shell><header className="menu-header"><Back href="/cliente" /><div><h1>Cardápio</h1><p>Restaurante Ditos</p></div><a href="/cliente/carrinho" className="bag">🛒<b>{totalItems}</b></a></header><section className="menu"><div className="chips"><button className="selected">Todos</button><button>Hambúrgueres</button><button>Pizzas</button><button>Porções</button></div><h2>Mais pedidos</h2>{items.map((item) => <article className="dish" key={item.id}><div className="dish-photo">{item.emoji}</div><div><h3>{item.name}</h3><p>{item.description}</p><b>{item.price}</b></div><button aria-label={`Adicionar ${item.name} ao carrinho`} onClick={() => add(item.id)}>+</button></article>)}</section>{totalItems > 0 && <CartBar total={formatPrice(total)} />}</Shell>; }

export function Cart() {
  const { items } = useMenuItems(); const { cart, change, clear, totalItems } = useCart(); const [sent, setSent] = useState(false);
  const lines = cart.flatMap((cartItem) => { const dish = items.find((item) => item.id === cartItem.dishId); return dish ? [{ dish, quantity: cartItem.quantity }] : []; });
  const total = lines.reduce((sum, line) => sum + toNumber(line.dish.price) * line.quantity, 0);
  function sendOrder() { if (lines.length === 0) return; clear(); setSent(true); }
  return <Shell><header className="menu-header"><Back href="/cliente/cardapio" /><div><h1>Carrinho</h1><p>{totalItems} {totalItems === 1 ? "item" : "itens"}</p></div></header><section className="cart">{sent ? <div className="order-sent"><span>✓</span><h2>Pedido enviado!</h2><p>O Restaurante Ditos recebeu seu pedido e em breve ele será preparado.</p><a className="solid-button" href="/cliente/cardapio">Fazer novo pedido</a></div> : lines.length === 0 ? <div className="order-sent"><span>🛒</span><h2>Seu carrinho está vazio</h2><p>Escolha seus itens no cardápio para iniciar um pedido.</p><a className="solid-button" href="/cliente/cardapio">Ver cardápio</a></div> : <><h2>Seu pedido</h2>{lines.map(({ dish, quantity }) => <article className="cart-item" key={dish.id}><span className="dish-photo mini">{dish.emoji}</span><div><h3>{dish.name}</h3><b>{dish.price}</b></div><div className="quantity"><button aria-label={`Remover uma unidade de ${dish.name}`} onClick={() => change(dish.id, quantity - 1)}>−</button><span>{quantity}</span><button aria-label={`Adicionar uma unidade de ${dish.name}`} onClick={() => change(dish.id, quantity + 1)}>+</button></div></article>)}<h2>Observações</h2><textarea placeholder="Alguma observação para o pedido?" /><h2>Forma de pagamento</h2><div className="payment"><span>💳</span><b>Cartão de crédito</b><span>›</span></div><div className="cart-total"><span>Total</span><b>{formatPrice(total)}</b></div></>}</section>{!sent && lines.length > 0 && <button className="checkout" onClick={sendOrder}>Enviar pedido <b>{formatPrice(total)}</b></button>}</Shell>;
}
