"use client";

import * as React from "react";
import Link from "next/link";
import { menuItems as menuData } from "@/components/layout/menu-data";
import { cn } from "@/lib/utils";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
    Users,
    User,
    Home,
    Utensils,
    Clock,
    Trophy,
    Music,
    UserCheck,
    GraduationCap,
    Baby,
    Shield,
    BookOpen,
    ShoppingCart,
    Shirt,
    Package,
    Monitor,
    ShoppingBag,
    CreditCard,
    Building,
    Receipt,
    DollarSign,
    BarChart3,
    Wallet,
    Landmark,
    TrendingUp,
    Search,
    FileText,
    Heart,
    Compass,
    Star,
    MessageCircle,
    Calendar,
    Wrench,
    AlertTriangle,
    Target,
    CheckSquare,
    Ruler,
    Lock,
    Database,
    FolderOpen,
    Settings,
} from "lucide-react";

// Mapeo de iconos para secciones principales
const sectionIcons = {
    "Personas": Users,
    "Servicios": Utensils,
    "Ventas": ShoppingCart,
    "Compras": Package,
    "Financiera": DollarSign,
    "RRHH": UserCheck,
    "Académica": GraduationCap,
    "Edificio": Building,
    "CRM": BarChart3,
    "Plataforma": Settings,
} as const;

// Mapeo de iconos para subitems
const subItemIcons = {
    // Personas
    "Personas": Users,
    "Gestión alumnos": User,
    "Gestión responsables": Users,
    "Gestión familias": Home,
    "Gestión Servicios Sociales": Heart,
    "Contactos": MessageCircle,
    
    // Servicios
    "Comedor": Utensils,
    "Madrugadores": Clock,
    "Extraescolares": Trophy,
    "Act. Culturales": Music,
    "One to One": UserCheck,
    "Bachillerato Dual": GraduationCap,
    "Guardería": Baby,
    "Seguros": Shield,
    "Gratuidad Libros": BookOpen,
    
    // Ventas
    "Venta Libros": BookOpen,
    "Venta Ropa deportiva": Shirt,
    "Gestión ventas": ShoppingCart,
    "Productos": Package,
    "Prestashop": Monitor,
    
    // Compras
    "Compras": ShoppingBag,
    "Gastos": CreditCard,
    "Proveedores": Building,
    "Acreedores": Users,
    
    // Financiera
    "Recibos": Receipt,
    "Cobros": DollarSign,
    "Presupuestos": BarChart3,
    "Pagos": CreditCard,
    "Caja": Wallet,
    "Banco": Landmark,
    "Contable": TrendingUp,
    "Consultas": Search,
    "Informes": FileText,
    "Estadísticas": BarChart3,
    
    // RRHH
    "Empleados - RRHH": Compass,
    "Formaciones": GraduationCap,
    "Bajas médicas": Heart,
    "Mutua y seguros": Shield,
    
    // Académica
    "Asignaturas": BookOpen,
    "Etapas, Ciclos y Clases": GraduationCap,
    "Horarios": Clock,
    "Asignaciones empleados": UserCheck,
    "Orientación": Compass,
    "Calidad": Star,
    "Secretaría": FileText,
    "Comunicación": MessageCircle,
    
    // Edificio
    "Gestión de Espacios": Building,
    "Reserva espacios": Calendar,
    "Mantenimiento": Wrench,
    "Evacuación": AlertTriangle,
    "Alquiler de espacios": Home,
    
    // CRM
    "Dashboard": BarChart3,
    "Potenciales": Target,
    "Registros": FileText,
    "Períodos": Calendar,
    "Tareas y agenda": CheckSquare,
    "Mediciones": Ruler,
    
    // Plataforma
    "Usuarios": Users,
    "Permisos": Lock,
    "Bases de datos": Database,
    "Administración documentos": FolderOpen,
} as const;

const MainMenu = () => {
    const menuRef = React.useRef<HTMLDivElement>(null);
    const [openItems, setOpenItems] = React.useState<Set<string>>(new Set());

    // Función para ajustar la posición del submenú
    const adjustSubmenuPosition = React.useCallback((triggerElement: HTMLElement, contentElement: HTMLElement) => {
        if (!triggerElement || !contentElement) return;

        const triggerRect = triggerElement.getBoundingClientRect();
        const contentRect = contentElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // Ancho del contenido del submenú
        const contentWidth = contentRect.width || 640; // Usar el ancho por defecto lg:w-[640px]
        
        // Posición inicial (centrado bajo el trigger)
        const triggerCenter = triggerRect.left + (triggerRect.width / 2);
        const contentLeft = triggerCenter - (contentWidth / 2);
        
        // Margen de seguridad
        const margin = 20;
        
        // Verificar si se sale por la izquierda
        if (contentLeft < margin) {
            contentElement.style.left = `${margin}px`;
            contentElement.style.right = 'auto';
            contentElement.style.transform = 'none';
        }
        // Verificar si se sale por la derecha
        else if (contentLeft + contentWidth > viewportWidth - margin) {
            contentElement.style.left = 'auto';
            contentElement.style.right = `${margin}px`;
            contentElement.style.transform = 'none';
        }
        // Centrar normalmente
        else {
            contentElement.style.left = '50%';
            contentElement.style.right = 'auto';
            contentElement.style.transform = 'translateX(-50%)';
        }
    }, []);

    // Manejar apertura/cierre de submenús
    React.useEffect(() => {
        const handleSubmenuToggle = () => {
            if (!menuRef.current) return;

            const triggers = menuRef.current.querySelectorAll('[data-slot="navigation-menu-trigger"]');
            const contents = menuRef.current.querySelectorAll('[data-slot="navigation-menu-content"]');

            triggers.forEach((trigger) => {
                const triggerElement = trigger as HTMLElement;
                const isOpen = triggerElement.getAttribute('data-state') === 'open';
                const menuItem = triggerElement.closest('[data-slot="navigation-menu-item"]');
                const content = menuItem?.querySelector('[data-slot="navigation-menu-content"]') as HTMLElement;

                if (isOpen && content) {
                    // Pequeño delay para permitir que el contenido se renderice
                    setTimeout(() => {
                        adjustSubmenuPosition(triggerElement, content);
                    }, 10);
                }
            });
        };

        // Observar cambios en los atributos data-state
        const observer = new MutationObserver(handleSubmenuToggle);
        
        if (menuRef.current) {
            observer.observe(menuRef.current, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-state']
            });
        }

        // También escuchar cambios de tamaño de ventana
        const handleResize = () => {
            handleSubmenuToggle();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [adjustSubmenuPosition]);

    return (
        <div ref={menuRef}>
            <NavigationMenu viewport={false}>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <Link href="/" legacyBehavior passHref>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                Inicio
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>

                    {menuData.map((item) => {
                        const SectionIcon = sectionIcons[item.title as keyof typeof sectionIcons];
                        
                        return (
                            <NavigationMenuItem key={item.title}>
                                <NavigationMenuTrigger className="flex items-center">
                                    {SectionIcon && (
                                        <SectionIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                                    )}
                                    {item.title}
                                </NavigationMenuTrigger>
                                <NavigationMenuContent className="z-50">
                                    <ul className="grid w-[420px] gap-3 p-4 md:w-[520px] md:grid-cols-2 lg:w-[640px] lg:grid-cols-2">
                                        {item.children.map((subItem) => {
                                            const SubItemIcon = subItemIcons[subItem.title as keyof typeof subItemIcons];
                                            
                                            return (
                                                <ListItem
                                                    key={subItem.title}
                                                    title={subItem.title}
                                                    href={subItem.href}
                                                    icon={SubItemIcon}
                                                >
                                                    {subItem.title}
                                                </ListItem>
                                            );
                                        })}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        );
                    })}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
};

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & {
        icon?: React.ComponentType<{ className?: string }>;
    }
>(({ className, title, children, icon: Icon, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="flex items-center text-sm font-medium leading-none">
                        {Icon && (
                            <Icon className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="truncate">{title}</span>
                    </div>
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";

export default MainMenu; 