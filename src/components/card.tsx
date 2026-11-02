import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Link } from "@tanstack/react-router";

interface DashboardCardProps {
	children: React.ReactNode;
	title: string;
	links?: string;
	types?: { value: string; label: string }[];
	type?: string;
	link?: string;
}

export default function DashboardCard({
	children,
	title,
	links,
	types,
	link,
	type,
}: DashboardCardProps) {
	return (
		<Card className="py-1 border-none shadow-none bg-white w-full h-full">
			<CardHeader className="p-0">
				<CardTitle className="flex items-center justify-between border-b border-gray-300 h-10">
					<div className="px-4 flex items-center justify-between w-full">
						<span className="text-md font-bold flex items-center gap-2">
							{title}
						</span>
						<span className="text-sm font-light flex items-center gap-2">
							{links &&
								<Link to={link} >
									View All
								</Link>
							}
							{types && (
								<Select>
									<SelectTrigger className="w-16 p-0">
										<SelectValue placeholder={type} />
									</SelectTrigger>
									<SelectContent>
										{types?.map((type) => (
											<SelectItem key={type.value} value={type.value}>
												{type.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</span>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}
