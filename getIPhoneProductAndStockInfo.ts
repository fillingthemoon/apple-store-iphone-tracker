import axios from 'axios'
import allIPhones from './allIPhones'

const millisToMinutesAndSeconds = (millis: any) => {
  var minutes = Math.floor(millis / 60000)
  var seconds = ((millis % 60000) / 1000).toFixed(0)
  return `${minutes} minute(s) and ${seconds} second(s)`
}

const getTimeRemaining = (timestamp: any, cooldownTime: any) => {
  const timeNow = new Date().getTime()
  const initialTimestamp = new Date(timestamp).getTime()
  const timeElapsed = timeNow - initialTimestamp
  if (timeNow - initialTimestamp < cooldownTime) {
    return millisToMinutesAndSeconds(cooldownTime - timeElapsed)
  } else {
    return false
  }
}

export const getIPhoneProductAndStockInfo = async (iPhoneType: any) => {
  const { model, color }: { model: string; color: string } = iPhoneType
  try {
    const iPhoneProductAndStockInfoPromiseArr: any[] = []
    allIPhones.forEach((iPhone) => {
      if (iPhone.model === model && iPhone.color === color) {
        const iPhoneStockInfo = axios.get(
          `https://www.apple.com/sg/shop/fulfillment-messages?pl=true&mts.0=regular&mts.1=compact&parts.0=${iPhone.productId}/A&searchNearby=true&store=R669`
        )
        const iPhoneProductInfo = axios.get(
          `https://www.apple.com/sg/shop/updateSummary?node=home%2Fshop_iphone%2Ffamily%2Fiphone_12&step=select&product=${iPhone.productId}%2FA&bfil=undefined`
        )
        iPhoneProductAndStockInfoPromiseArr.push(iPhoneStockInfo)
        iPhoneProductAndStockInfoPromiseArr.push(iPhoneProductInfo)
      }
    })
    const iPhoneProductAndStockInfoPromiseRes = await Promise.all(
      iPhoneProductAndStockInfoPromiseArr
    )

    const iPhoneProductAndStockInfo: any[] =
      iPhoneProductAndStockInfoPromiseRes.reduce((prev, next, i) => {
        if (i % 2 == 0) {
          const stores =
            iPhoneProductAndStockInfoPromiseRes[i].data.body.content
              .pickupMessage.stores

          const productInfo =
            iPhoneProductAndStockInfoPromiseRes[i + 1].data.body.response
              .summarySection.summary

          const productId = Object.keys(
            stores[0].partsAvailability
          )[0].substring(0, 7)

          prev.push({
            productId,
            model:
              stores[0].partsAvailability[`${productId}/A`].messageTypes.regular
                .storePickupProductTitle,
            stores: stores.map((store: any) => ({
              address: store.address.address,
              storePickupQuote:
                store.partsAvailability[`${productId}/A`].messageTypes.regular
                  .storePickupQuote,
            })),
            productInfo: {
              dimensionColor: productInfo.productDimensions.dimensionColor,
              dimensionCapacity:
                productInfo.productDimensions.dimensionCapacity,
              priceString: productInfo.priceData.fullPrice.priceString,
            },
          })
        }
        return prev
      }, [])
    return iPhoneProductAndStockInfo
  } catch (err) {
    console.log('Error', err)

    return []
  }
}
