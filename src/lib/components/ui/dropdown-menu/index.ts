import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import DropdownMenuContent from "./dropdown-menu-content.svelte";
import DropdownMenuItem from "./dropdown-menu-item.svelte";
import DropdownMenuSeparator from "./dropdown-menu-separator.svelte";
import DropdownMenuTrigger from "./dropdown-menu-trigger.svelte";

const Root = DropdownMenuPrimitive.Root;
const Trigger = DropdownMenuTrigger;
const Content = DropdownMenuContent;
const Item = DropdownMenuItem;
const CheckboxItem = DropdownMenuPrimitive.CheckboxItem;
const RadioItem = DropdownMenuPrimitive.RadioItem;
const Label = DropdownMenuPrimitive.Label;
const Separator = DropdownMenuSeparator;
const Arrow = DropdownMenuPrimitive.Arrow;
const Group = DropdownMenuPrimitive.Group;
const Sub = DropdownMenuPrimitive.Sub;
const SubContent = DropdownMenuPrimitive.SubContent;
const SubTrigger = DropdownMenuPrimitive.SubTrigger;
const RadioGroup = DropdownMenuPrimitive.RadioGroup;

export {
	Root,
	Trigger,
	Content,
	Item,
	CheckboxItem,
	RadioItem,
	Label,
	Separator,
	Arrow,
	Group,
	Sub,
	SubContent,
	SubTrigger,
	RadioGroup,
	//
	Root as DropdownMenu,
	Content as DropdownMenuContent,
	Item as DropdownMenuItem,
	CheckboxItem as DropdownMenuCheckboxItem,
	RadioItem as DropdownMenuRadioItem,
	Label as DropdownMenuLabel,
	Separator as DropdownMenuSeparator,
	Trigger as DropdownMenuTrigger,
	Group as DropdownMenuGroup,
	Sub as DropdownMenuSub,
	SubContent as DropdownMenuSubContent,
	SubTrigger as DropdownMenuSubTrigger,
	RadioGroup as DropdownMenuRadioGroup,
};