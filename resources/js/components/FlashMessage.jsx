import React, { useEffect } from "react"
import { toast } from "sonner"
import { usePage } from "@inertiajs/react"

export default function FlashMessage() {
  const { props } = usePage()

  useEffect(() => {
    if (props.flash?.success) toast.success(props.flash.success)
    if (props.flash?.error) toast.error(props.flash.error)
  }, [props.flash])

  return null
}
