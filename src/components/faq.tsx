import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./ui/accordion";

export default function Faq() {
	return (
		<div className="flex flex-col items-center justify-center gap-6 py-10">
			<div className="flex flex-col items-center justify-center gap-2 max-w-md">
				<h2 className="sm:text-3xl text-2xl font-semibold text-foreground">
					Frequently Asked Questions
				</h2>
				<p className="sm:text-base text-sm text-muted-foreground text-center">
					Everything you need to know about ExportNoCode. Find answers to common
					questions.
				</p>
			</div>
			<div className="w-full max-w-lg">
				<Accordion
					type="single"
					collapsible
					className="w-full flex flex-col gap-4"
				>
					<AccordionItem value="item-1">
						<AccordionTrigger className="hover:no-underline">
							What is ExportNoCode?
						</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
							ExportNoCode lets you download and deploy no‑code websites starting with Framer.
							Paste a site URL to extract static HTML, then host it anywhere.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-2">
						<AccordionTrigger className="hover:no-underline">
							How do I use ExportNoCode?
						</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
							Enter a supported site URL and click "Download".
							We’ll mirror the site and give you a ZIP with HTML files.
							Deployment features are coming soon.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-3">
						<AccordionTrigger className="hover:no-underline">
							What features are coming soon?
						</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
							We're working on adding direct deployment options to various hosting platforms,
							advanced customization features, and analytics integration. Stay tuned for these
							exciting updates!
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-4">
						<AccordionTrigger className="hover:no-underline">
							Is ExportNoCode free to use?
						</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
							The basic download functionality is free to use. Premium features like
							deployment options and advanced customization will be available with 
							subscription plans in the future.
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
}
