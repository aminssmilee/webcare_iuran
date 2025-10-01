import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CheckCircle2Icon, LoaderIcon, MoreVerticalIcon } from "lucide-react"
import { toast } from "sonner"
import { DragHandle } from "./DraggableRow"
import { TableCellViewer } from "./TableCellViewer"

export const columns = [
    {
        id: "drag",
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "header",
        header: "Header",
        cell: ({ row }) => <TableCellViewer item={row.original} />,
        enableHiding: false,
    },
    {
        accessorKey: "type",
        header: "Section Type",
        cell: ({ row }) => (
            <Badge variant="outline" className="px-1.5 text-muted-foreground">
                {row.original.type}
            </Badge>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant="outline" className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3">
                {row.original.status === "Done" ? (
                    <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
                ) : (
                    <LoaderIcon />
                )}
                {row.original.status}
            </Badge>
        ),
    },
    {
        accessorKey: "target",
        header: () => <div className="w-full text-right">Target</div>,
        cell: ({ row }) => (
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
                        loading: `Saving ${row.original.header}`,
                        success: "Done",
                        error: "Error",
                    })
                }}>
                <Label htmlFor={`${row.original.id}-target`} className="sr-only">
                    Target
                </Label>
                <Input
                    className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
                    defaultValue={row.original.target}
                    id={`${row.original.id}-target`}
                />
            </form>
        ),
    },
    // ... (limit, reviewer, actions dsb )
    {
        accessorKey: "reviewer",
        header: "Reviewer",
        cell: ({ row }) => {
            const isAssigned = row.original.reviewer !== "Assign reviewer"

            if (isAssigned) {
                return row.original.reviewer
            }

            return (
                <>
                    <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
                        Reviewer
                    </Label>
                    <Select>
                        <SelectTrigger className="h-8 w-40" id={`${row.original.id}-reviewer`}>
                            <SelectValue placeholder="Assign reviewer" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                            <SelectItem value="Jamik Tashpulatov">
                                Jamik Tashpulatov
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </>
            );
        },
    },
    {
        id: "actions",
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                        size="icon">
                        <MoreVerticalIcon />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Make a copy</DropdownMenuItem>
                    <DropdownMenuItem>Favorite</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
]
