import { Link } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRIMARY_EMERGENCY_NUMBER, telHref } from "@/lib/emergency-numbers";
import Layout from "@/components/Layout";

const NotFound = () => (
  <Layout>
    <div className="container flex flex-col items-start gap-6 py-24 sm:py-32">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">Error 404</p>
      <h1 className="font-display text-4xl font-bold tracking-tight">We couldn't find that page</h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        The link may be broken or the page may have moved. If you scanned a QR code, check that the whole code was
        captured and try again.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Go to the home page
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href={telHref(PRIMARY_EMERGENCY_NUMBER.number)}>
            <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
            Emergency? Call {PRIMARY_EMERGENCY_NUMBER.number}
          </a>
        </Button>
      </div>
    </div>
  </Layout>
);

export default NotFound;
