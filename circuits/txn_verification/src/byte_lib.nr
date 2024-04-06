
struct CompConstant<N> {
}

trait New<N> {
	fn new() -> CompConstant<N>;
}

impl<N> New<N> for CompConstant<N> {
	fn new() -> CompConstant<N> {
		CompConstant{}
	}
}

fn grab_bvec_conditional<T, N, C, Env>(
    bvec: BoundedVec<T, N>,
    offset: u64,
    little_endian: bool,
    _theoretical_max: CompConstant<C>,
    runtime_max: fn[Env](u64) -> bool
) -> BoundedVec<T, C>
		where T: Default {
    let mut out: BoundedVec<T, C> = BoundedVec::new();
    for i in 0..C {
        if runtime_max(i) {
            if little_endian {
				out.push(bvec.get((offset + C)-1-i));
            } else {
				out.push(bvec.get(offset + i));
            }
        }
    }
    out
}

pub fn grab_bvec_be_conditional<T, N, C, Env>(
    max: CompConstant<C>,
    bvec: BoundedVec<T, N>,
    offset: u64,
    runtime_max: fn[Env](u64) -> bool
) -> BoundedVec<T, C>  where T: Default {
    grab_bvec_conditional(bvec, offset, false, max, runtime_max) 
}

pub fn grab_bvec_le_conditional<T, N, C, Env>(
    max: CompConstant<C>,
    bvec: BoundedVec<T, N>,
    offset: u64,
    runtime_max: fn[Env](u64) -> bool
) -> BoundedVec<T, C>  where T: Default {
    grab_bvec_conditional(bvec, offset, true, max, runtime_max)
}


// `_theoretical_max` needs to be const-generic-esque b/c for loops must be known at compile time
fn grab_bytes_conditional<T, N, C, Env>(
    bvec: BoundedVec<T, N>,
    offset: u64,
    little_endian: bool,
    _theoretical_max: CompConstant<C>,
    runtime_max: fn[Env](u64) -> bool
) -> [T; C]
		where T: Default {
    let mut out: [T; C] = [T::default(); C];
    for i in 0..C {
        if runtime_max(i) {
            if little_endian {
                out[i] = bvec.get((offset + C)-1-i);
            } else {
                out[i] = bvec.get(offset + i);
            }
        }
    }
    out
}

pub fn grab_bytes_be<T, N, C>(
    max: CompConstant<C>,
    bvec: BoundedVec<T, N>,
    offset: u64
) -> [T; C] where T: Default {
    grab_bytes_conditional(bvec, offset, false, max, |_| true)
}

pub fn grab_bytes_le<T, N, C>(
    max: CompConstant<C>,
    bvec: BoundedVec<T, N>,
    offset: u64
) -> [T; C] where T: Default {
    grab_bytes_conditional(bvec, offset, true, max, |_| true)
}

pub fn grab_bytes_be_conditional<T, N, C, Env>(
    max: CompConstant<C>,
    bvec: BoundedVec<T, N>,
    offset: u64,
    runtime_max: fn[Env](u64) -> bool
) -> [T; C] where T: Default {
    grab_bytes_conditional(bvec, offset, false, max, runtime_max)
}

pub fn grab_bytes_le_conditional<T, N, C, Env>(
    max: CompConstant<C>,
    bvec: BoundedVec<T, N>,
    offset: u64,
    runtime_max: fn[Env](u64) -> bool
) -> [T; C] where T: Default {
    grab_bytes_conditional(bvec, offset, true, max, runtime_max)
}



