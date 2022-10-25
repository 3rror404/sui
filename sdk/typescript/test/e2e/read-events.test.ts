// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeAll } from 'vitest';
import { setup, TestToolbox } from './utils/setup';

describe('Event Reading API', () => {
  let toolbox: TestToolbox;

  beforeAll(async () => {
    toolbox = await setup();
  });

  it('Get All Events', async () => {
    const allEvents = await toolbox.provider.getEvents("All", null, null, "Ascending");
    expect(allEvents.data.length).to.greaterThan(0);
    expect(allEvents.nextCursor).toEqual(null);
  });

  it('Get all event paged', async () => {
    const page1 = await toolbox.provider.getEvents("All",null,2, "Descending");
    expect(page1.nextCursor).to.not.equal(null);
    const page2 = await toolbox.provider.getEvents("All",page1.nextCursor,1000, "Descending");
    expect(page2.nextCursor).toEqual(null);
  });

  it('Get events', async () => {
    const query1 = await toolbox.provider.getEvents({Sender: toolbox.address()}, null, 2, "Descending");
    expect(query1.data.length).toEqual(0);
    const query2 = await toolbox.provider.getEvents({Recipient: {AddressOwner: toolbox.address()}}, null, 2, "Descending");
    expect(query2.data.length).toEqual(2);
  });
});