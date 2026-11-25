import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/UI/Accordion";
import { FAQ } from "@/data/contact";

/** Contact page FAQ - single-open accordion (first item open by default). */
export default function ContactFaq() {
    return (
        <div className="grain border-border bg-card/55 relative overflow-hidden rounded-2xl border-2 px-5 md:px-7">
            <Accordion type="single" collapsible defaultValue="faq-0">
                {FAQ.map((item, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                        <AccordionTrigger className="aria-expanded:text-foreground py-5 text-base font-bold leading-snug md:text-lg">
                            {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="font-quote max-w-[64ch] pb-6 pr-2 text-sm leading-[1.8] md:text-base">
                            {item.a}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
