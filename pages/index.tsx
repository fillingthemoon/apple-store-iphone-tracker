import type { NextPage } from 'next'
import Head from 'next/head'

import { Stack, Table, Title, Alert } from '@mantine/core'

import { getIPhoneProductAndStockInfo } from '../getIPhoneProductAndStockInfo'

import React, { useEffect, useState } from 'react'

import theme from '../theme'

const { available, unavailable } = theme.colors

const Cols = (props: any) => {
  const { appleStores }: { appleStores: any[] } = props

  return (
    <tr>
      {/* <th>{`ID`}</th> */}
      {['Model', 'Color', 'Capacity', 'Price'].map((colName, i) => (
        <th key={i}>{colName}</th>
      ))}
      {appleStores.map((appleStore, i) => (
        <th key={i}>{appleStore}</th>
      ))}
    </tr>
  )
}

const Home: NextPage = (props: any) => {
  const { iPhoneProductAndStockInfo } = props

  const [appleStores, setAppleStores] = useState([])

  useEffect(() => {
    if (iPhoneProductAndStockInfo.length > 0) {
      const stores = iPhoneProductAndStockInfo[0]?.stores
      setAppleStores(stores.map((store: any) => store.address))
    }
  }, [])

  if (iPhoneProductAndStockInfo.length <= 0) {
    return (
      <Alert m={10} title="Error" color="red">
        {`O no, you've encountered an error, please try again later!`}
      </Alert>
    )
  }

  const rows = iPhoneProductAndStockInfo.map((iPhoneRow: any, i: number) => {
    const { id, model, productInfo, stores } = iPhoneRow
    const {
      dimensionColor: color,
      dimensionCapacity: capacity,
      priceString: price,
    } = productInfo

    return (
      <tr key={i}>
        {/* <td>{id}</td> */}
        {[model, color, capacity, price].map((colName, i) => (
          <td key={i}>{colName}</td>
        ))}
        {stores.map((store: any, j: number) => {
          const quote = store.storePickupQuote
          return (
            <td
              key={j}
              style={{
                backgroundColor: quote.includes('unavailable')
                  ? unavailable
                  : available,
              }}
            >
              {quote}
            </td>
          )
        })}
      </tr>
    )
  })

  return (
    <div>
      <Head>
        <title>{`Apple Store iPhone Tracker`}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Stack spacing="sm" m={10}>
        <Title>{`Apple Store iPhone Tracker`}</Title>
        <Table striped>
          <thead>
            <Cols appleStores={appleStores} />
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </Stack>
    </div>
  )
}

export async function getServerSideProps() {
  const iPhoneProductAndStockInfo = await getIPhoneProductAndStockInfo()

  return {
    props: {
      iPhoneProductAndStockInfo,
    },
  }
}

export default Home
