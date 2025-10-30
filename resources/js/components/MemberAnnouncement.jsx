"use client"

import { useRef, useState, useEffect } from "react"
import { Megaphone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { RefreshCcwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function MemberAnnouncement({ announcements = [] }) {
  const [current, setCurrent] = useState(0)
  const carouselRef = useRef(null)

  if (!announcements.length) {
    return (
       <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Megaphone />
        </EmptyMedia>
        <EmptyTitle>Tidak ada pengumuman terbaru</EmptyTitle>
        <EmptyDescription>
          Seluruh pengumuman terbaru akan ditampilkan di sini.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
    )
  }

  return (
    <div className="mt-6 w-full flex flex-col items-center px-3 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 self-start">
        <Megaphone className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Pengumuman</h2>
      </div>

      {/* Carousel Horizontal */}
      <Carousel
        setApi={(api) => {
          carouselRef.current = api
          if (api) {
            api.on("select", () => {
              setCurrent(api.selectedScrollSnap())
            })
          }
        }}
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl relative"
      >
        <CarouselContent className="-ml-2 sm:-ml-4 py-2">
          {announcements.map((item) => (
            <CarouselItem key={item.id} className="pl-2 sm:pl-4 basis-full">
              <Card className="bg-green-50 border border-border rounded-xl shadow-md transition-all duration-200 hover:shadow-lg">
                <CardContent className="flex flex-col items-center justify-center text-center p-6 md:p-8">
                  <h3 className="font-semibold text-lg md:text-xl text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground mt-2 leading-relaxed">
                    {item.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    {new Date(item.publish_date).toLocaleDateString("id-ID")}
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-0 sm:-left-6 bg-background/80 backdrop-blur-sm rounded-full" />
        <CarouselNext className="right-0 sm:-right-6 bg-background/80 backdrop-blur-sm rounded-full" />
      </Carousel>

      {/* Indikator Dots */}
      <div className="flex justify-center mt-3 space-x-2">
        {announcements.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrent(index)
              carouselRef.current?.scrollTo(index)
            }}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === current
                ? "bg-green-600 w-5"
                : "bg-gray-300 hover:bg-gray-400 w-2.5"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
