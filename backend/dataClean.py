import pandas as pd


def edit_nan_values(group, col, global_mean=None):
 
    indexOfCol = group.columns.get_loc(col)

    if group[col].isna().all():
        if global_mean is None:
            global_mean = group[col].mean()
        group[col] = global_mean
        return group

    for index in range(0, len(group)):
        above_val = None
        below_val = None

        if pd.isna(group.iloc[index, indexOfCol]):

            if index == 0:
                for i in range(1, len(group)):
                    if not pd.isna(group.iloc[i, indexOfCol]):
                        above_val = group.iloc[i, indexOfCol]
                        break
                group.iloc[0, indexOfCol] = above_val
                above_val = None

            elif index == len(group) - 1:
                for i in range(len(group) - 2, -1, -1):
                    if not pd.isna(group.iloc[i, indexOfCol]):
                        below_val = group.iloc[i, indexOfCol]
                        break
                group.iloc[index, indexOfCol] = below_val
                below_val = None

            # Handle other rows in the middle
            else:
                # Look above for the first available value
                for i in range(index - 1, -1, -1):
                    if not pd.isna(group.iloc[i, indexOfCol]):
                        above_val = group.iloc[i, indexOfCol]
                        break

                # Look below for the first available value
                for i in range(index + 1, len(group)):
                    if not pd.isna(group.iloc[i, indexOfCol]):
                        below_val = group.iloc[i, indexOfCol]
                        break

                # If both above and below values are found, use their average
                if above_val is not None and below_val is not None:
                    group.iloc[index, indexOfCol] = (above_val + below_val) / 2
                # If only one value is found, use that
                elif above_val is not None:
                    group.iloc[index, indexOfCol] = above_val
                elif below_val is not None:
                    group.iloc[index, indexOfCol] = below_val

    return group

