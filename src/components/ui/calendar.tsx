// import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DayPickerSingleProps } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Check, X } from "lucide-react";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"

const formatTime = (timeStr: string) => {
	try {
		const [hours, minutes] = timeStr.split(':');
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const hour12 = hour % 12 || 12;
		return `${hour12}:${minutes} ${ampm}`;
	} catch (error) {
		return timeStr;
	}
};

interface CalendarProps extends DayPickerSingleProps {
	className?: string;
	classNames?: {
		months?: string;
		month?: string;
		caption?: string;
		caption_label?: string;
		nav?: string;
		nav_button?: string;
		nav_button_previous?: string;
		nav_button_next?: string;
		table?: string;
		head_row?: string;
		head_cell?: string;
		row?: string;
		cell?: string;
		day?: string;
		day_selected?: string;
		day_today?: string;
		day_outside?: string;
		day_disabled?: string;
		day_range_middle?: string;
		day_hidden?: string;
	};
	showOutsideDays?: boolean;
	attendClasses?: any[];
	missedClasses?: any[];
	upcomingClasses?: any[];
}

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	selected,
	onSelect,
	attendClasses = [],
	missedClasses = [],
	upcomingClasses = [],
	...props
}: CalendarProps) {
	// Ensure all dates are Date objects
	const attendDates = attendClasses.filter(c => c.status === "Completed")
		.map(c => new Date(`${c.class_date}T${c.class_time}`));

	const missedDates = missedClasses.filter(c => c.status === "Missed")
		.map(c => new Date(`${c.class_date}T${c.class_time}`));

	const upcomingDates = upcomingClasses.filter(c => c.status === "Scheduled")
		.map(c => new Date(`${c.class_date}T${c.class_time}`));


	// Modifiers for DayPicker
	const modifiers = {
		attended: attendDates,
		missed: missedDates,
		upcoming: upcomingDates,
	};

	const getIconForDay = (day: Date) => {
		const dateStr = day.toDateString(); // Simplifies date comparison

		if (attendDates.some(d => d.toDateString() === dateStr)) {
			return <Check className="w-4 h-4 text-green-600" />;
		}
		if (missedDates.some(d => d.toDateString() === dateStr)) {
			return <X className="w-4 h-4 text-red-500" />;
		}
		if (upcomingDates.some(d => d.toDateString() === dateStr)) {
			return <div className="w-1.5 h-1.5 bg-secondary rounded-full absolute top-6 left-3.5" />;
		}
		return null;
	};

	const getTimeForDay = (day: Date) => {
		const dateStr = day.toDateString();
		const upcomingClass = upcomingClasses.find(c => new Date(`${c.class_date}T${c.class_time}`).toDateString() === dateStr);
		return upcomingClass ? formatTime(upcomingClass.class_time) : null;
	};

	// Custom class names for each modifier
	const modifiersClassNames = {
		attended: "after",
		missed: "bg-red-500",
		upcoming: "after:content-[] after:text-xs after:bg-secondary after:absolute after:top-8 after:left-4.5 after:w-2 after:h-2 after:px-1 after:rounded-full",
	};

	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn("p-3 relative w-[90%] mx-auto", className)}
			weekStartsOn={1}
			selected={selected}
			onSelect={onSelect}
			defaultMonth={new Date()}
			formatters={{
				formatWeekdayName: (day) => day.toString().slice(0, 3),
			}}
			components={{
				Day: ({ day, modifiers }) => {
					const icon = getIconForDay(day.date);
					const isToday = modifiers.today;
					const time = modifiers.upcoming ? getTimeForDay(day.date) : null;
					const modifier = modifiers.attended
						? "attended"
						: modifiers.missed
							? "missed"
							: modifiers.upcoming
								? "upcoming"
								: null;

					const dayContent = (
						<div className="relative flex justify-center items-center gap-6 h-full w-full text-sm" >
							{/* Show icon only if modifier exists */}
							{icon && modifier === "missed" ? (
								<div className={cn(
									"absolute top-2 right-4 z-10 p-1 rounded-full",
									isToday && "bg-primary text-white font-bold"
								)}>
									{icon}
								</div>
							) : icon && modifier === "attended" ? (
								<div className={cn(
									"absolute top-0.5 right-3.5 z-10 p-1.5 rounded-full",
									isToday && "bg-primary text-white font-bold"
								)}>
									{icon}
								</div>
							) : icon && modifier === "upcoming" ? (
								<div className="absolute -top-[0.0001rem] right-[0.25rem] z-10 w-10 h-8">
									<div className={cn(
										"size-8 flex items-center justify-center  rounded-full",
										isToday && "bg-primary text-white font-bold"
									)}>
										{day.date.getDate()}
									</div>
									{icon}
								</div>
							) : <div
								className={cn(
									"w-8 h-8 flex items-center justify-center rounded-full",
									isToday && "bg-primary text-white font-bold"
								)}
							>
								<div className="size-10 flex items-center justify-center">
									{day.date.getDate()}
								</div>
							</div>}
						</div>
					);

					if (time) {
						return (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										{dayContent}
									</TooltipTrigger>
									<TooltipContent className="text-white">
										<p>Upcoming Class: {time}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						);
					}

					return dayContent;
				},
			}}

			classNames={{
				months: "flex flex-col gap-2 w-full",
				month: "flex flex-col gap-4 w-full",
				caption: "flex justify-center pt-1 relative items-center w-full",
				caption_label: "text-md absolute top-3 left-1/2 -translate-x-1/2 font-semibold text-center",
				nav: "flex items-center justify-between gap-1",
				nav_button: cn(
					buttonVariants({ variant: "outline" }),
					"size-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-full border-gray-400"
				),
				nav_button_previous: "absolute left-1",
				nav_button_next: "absolute right-1",
				table: "w-full border-collapse space-x-1",
				head_row: "flex justify-around w-full",
				head_cell:
					"text-gray-500 rounded-md w-8 font-semibold text-sm uppercase py-2",
				row: "flex w-full mt-2 justify-between w-full",
				cell: cn(
					"relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
					"[&:has([aria-selected])]:bg-accent"
				),
				day: cn(
					buttonVariants({ variant: "ghost" }),
					"size-10 p-0 font-normal cursor-pointer !rounded-full hover:bg-[#013370] hover:text-white relative",
					"data-[selected]:!bg-primary/80 data-[selected]:!text-white"
				),
				day_range_start:
					"day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
				day_range_end:
					"day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
				day_selected:
					"!bg-primary/80 !text-white !rounded-full",
				day_today:
					"!bg-primary/80 !text-white !border !border-[#013370] font-semibold rounded-full",
				day_outside:
					"day-outside text-muted-foreground aria-selected:text-muted-foreground",
				day_disabled: "text-muted-foreground opacity-50",
				day_range_middle:
					"aria-selected:bg-accent aria-selected:text-accent-foreground",
				day_hidden: "invisible",
				...classNames,
			}}
			modifiers={modifiers}
			modifiersClassNames={modifiersClassNames}
			{...props}
		/>
	);
}

export { Calendar }

