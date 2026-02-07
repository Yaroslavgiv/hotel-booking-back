import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Hotel {
    id: ID!
    name: String!
    address: String!
    description: String
    rooms: [Room!]!
  }

  type Room {
    id: ID!
    number: String!
    type: String!
    price: Float!
    hotel: Hotel!
    hotelId: ID!
  }

  type Booking {
    id: ID!
    guestName: String!
    guestEmail: String!
    checkIn: String!
    checkOut: String!
    room: Room!
    roomId: ID!
    isActive: Boolean!
    createdAt: String!
  }

  type AvailabilityResult {
    available: Boolean!
    conflictingBookings: [Booking!]!
  }

  input CreateBookingInput {
    roomId: ID!
    guestName: String!
    guestEmail: String!
    checkIn: String!
    checkOut: String!
  }

  type Query {
    hotels: [Hotel!]!
    hotel(id: ID!): Hotel
    rooms: [Room!]!
    roomsByHotel(hotelId: ID!): [Room!]!
    checkAvailability(roomId: ID!, checkIn: String!, checkOut: String!): AvailabilityResult!
  }

  type Mutation {
    createBooking(input: CreateBookingInput!): Booking!
    cancelBooking(id: ID!): Booking!
  }
`;
